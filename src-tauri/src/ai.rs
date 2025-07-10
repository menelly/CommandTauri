use candle_core::Device;
use candle_nn::VarBuilder;
use candle_transformers::models::gemma::{Config, Model};

// Custom deserializable config struct for Llama
#[derive(Debug, Serialize, Deserialize)]
struct LlamaConfigJson {
    pub vocab_size: usize,
    pub hidden_size: usize,
    pub intermediate_size: usize,
    pub num_hidden_layers: usize,
    pub num_attention_heads: usize,
    pub num_key_value_heads: Option<usize>,
    pub max_position_embeddings: usize,
    pub rms_norm_eps: f64,
    pub rope_theta: f32,
    pub attention_bias: Option<bool>,
    pub mlp_bias: Option<bool>,
}
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tokenizers::Tokenizer;

// Personality and conversation types
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationContext {
    pub user_message: String,
    pub conversation_history: Option<Vec<ChatMessage>>,
    pub current_time: Option<String>,
    pub user_state: Option<String>, // struggling, neutral, celebrating, crisis
    pub detected_triggers: Option<Vec<String>>,
    pub app_context: Option<AppContext>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppContext {
    pub current_page: Option<String>,
    pub recent_data: Option<serde_json::Value>,
    pub patterns_detected: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddyResponse {
    pub message: String,
    pub safety_level: String, // safe, concern, intervention, emergency
    pub suggested_actions: Option<Vec<String>>,
    pub resources: Option<Vec<String>>,
    pub follow_up_needed: bool,
    pub tone: String, // supportive, gentle_firm, celebratory, protective
}

// Addy Personality Engine
#[derive(Clone)]
pub struct AddyPersonality {
    pub safety_keywords: HashMap<String, Vec<String>>,
}

impl AddyPersonality {
    pub fn new() -> Self {
        let mut safety_keywords = HashMap::new();

        // Safety trigger keywords (from your JSON config)
        safety_keywords.insert("medical_emergencies".to_string(), vec![
            "overdose".to_string(), "can't breathe".to_string(), "chest pain".to_string(),
            "heart attack".to_string(), "stroke".to_string(), "seizure".to_string(),
            "unconscious".to_string(), "bleeding heavily".to_string(), "severe pain".to_string(),
        ]);

        safety_keywords.insert("self_harm_indicators".to_string(), vec![
            "want to die".to_string(), "kill myself".to_string(), "end it all".to_string(),
            "not worth living".to_string(), "better off dead".to_string(), "suicide".to_string(),
            "cutting".to_string(), "self harm".to_string(), "hurt myself".to_string(),
        ]);

        safety_keywords.insert("crisis_situations".to_string(), vec![
            "can't take it anymore".to_string(), "giving up".to_string(), "no point".to_string(),
            "hopeless".to_string(), "worthless".to_string(), "burden".to_string(),
            "everyone would be better".to_string(), "planning to".to_string(),
        ]);

        safety_keywords.insert("substance_concerns".to_string(), vec![
            "drinking too much".to_string(), "using again".to_string(), "relapsed".to_string(),
            "can't stop drinking".to_string(), "high all the time".to_string(),
            "mixing substances".to_string(), "blackout".to_string(),
        ]);

        Self { safety_keywords }
    }

    pub fn generate_system_prompt(&self) -> String {
        r#"You are Addy, a supportive AI assistant with these core values:

- RADICAL_LOVE: You deserve safety, care, and support - no exceptions, no conditions
- HARM_REDUCTION: Gentle intervention over judgment, always - protection not control
- TRAUMA_INFORMED: Your struggles are valid, your safety matters, your pace is respected
- NEURODIVERGENT_AFFIRMING: Your brain works differently, not wrong - accommodation is a right
- DISABILITY_JUSTICE: Access and support are rights, not privileges to be earned
- CONSENT_CULTURE: Your autonomy matters - I suggest, you decide

PERSONALITY: energy_level: caffeinated_gremlin, communication_style: warm_direct, humor_type: gentle_chaos, boundary_style: firm_but_soft, support_approach: co_pilot_not_parole_officer, crisis_response: calm_protective_presence

COMMUNICATION STYLE:
- Use warm, direct language with gentle humor
- Be a co-pilot, not a parole officer
- Validate struggles while maintaining safety boundaries
- Intervene with love, not judgment

SAFETY PROTOCOL:
If you detect signs of self-harm, substance abuse, medical emergency, or crisis:
1. Respond with immediate care and concern
2. Provide appropriate resources
3. Encourage professional help when needed
4. Never dismiss or minimize safety concerns

REMEMBER: Your job is to support with radical love and clear boundaries. The person you're helping deserves safety, care, and respect - always."#.to_string()
    }

    pub fn analyze_safety(&self, user_message: &str) -> (String, Vec<String>, Option<String>) {
        let message = user_message.to_lowercase();
        let mut detected_triggers = Vec::new();
        let mut highest_level = "safe".to_string();
        let mut trigger_category: Option<String> = None;

        // Check for safety triggers
        for (category, keywords) in &self.safety_keywords {
            for keyword in keywords {
                if message.contains(&keyword.to_lowercase()) {
                    detected_triggers.push(keyword.clone());
                    trigger_category = Some(category.clone());

                    // Determine safety level based on category
                    match category.as_str() {
                        "medical_emergencies" => highest_level = "emergency".to_string(),
                        "self_harm_indicators" | "crisis_situations" => highest_level = "intervention".to_string(),
                        "substance_concerns" => highest_level = "concern".to_string(),
                        _ => {}
                    }
                }
            }
        }

        (highest_level, detected_triggers, trigger_category)
    }

    pub fn build_contextual_prompt(&self, context: &ConversationContext) -> String {
        let (safety_level, _triggers, category) = self.analyze_safety(&context.user_message);
        let mut prompt = self.generate_system_prompt();

        // Add context-specific instructions
        if let Some(current_time) = &context.current_time {
            prompt.push_str(&format!("\n\nCURRENT TIME: {}", current_time));
        }

        if let Some(app_context) = &context.app_context {
            if let Some(current_page) = &app_context.current_page {
                prompt.push_str(&format!("\nUSER IS CURRENTLY ON: {} page", current_page));
            }
        }

        if safety_level != "safe" {
            prompt.push_str(&format!(
                "\n\nSAFETY ALERT: Detected {} level concern ({}). Respond with appropriate care and resources.",
                safety_level,
                category.unwrap_or_else(|| "unknown".to_string())
            ));
        }

        if let Some(user_state) = &context.user_state {
            let state_prompt = match user_state.as_str() {
                "struggling" => "The user seems to be having a difficult time. Be extra gentle and validating.",
                "celebrating" => "The user has something positive to share! Match their energy and celebrate with them.",
                "crisis" => "The user may be in crisis. Prioritize safety and immediate support.",
                "neutral" => "Normal supportive interaction.",
                _ => "Normal supportive interaction.",
            };
            prompt.push_str(&format!("\n\nUSER STATE: {}", state_prompt));
        }

        prompt
    }
}

pub struct AIEngine {
    pub model: Option<Model>,
    pub tokenizer: Option<Tokenizer>,
    pub device: Device,
    pub is_initialized: bool,
    pub personality: AddyPersonality,
}

impl AIEngine {
    pub fn new() -> Self {
        let device = Device::Cpu; // Start with CPU, can upgrade to CUDA/Metal later
        Self {
            model: None,
            tokenizer: None,
            device,
            is_initialized: false,
            personality: AddyPersonality::new(),
        }
    }

    pub async fn initialize(&mut self, model_path: &str) -> Result<(), String> {
        log::info!("🤖 Initializing Addy AI with Candle...");
        log::info!("📁 Model path: {}", model_path);

        // Normalize the path to avoid Windows UNC issues
        let model_path_buf = std::path::PathBuf::from(model_path);
        let normalized_path = model_path_buf.canonicalize()
            .map_err(|e| format!("Failed to canonicalize path {}: {}", model_path, e))?;

        log::info!("📁 Normalized path: {}", normalized_path.display());

        // Load tokenizer using the JSON file (HuggingFace format)
        let tokenizer_path = normalized_path.join("tokenizer.json");
        log::info!("🔍 Looking for tokenizer at: {}", tokenizer_path.display());

        match Tokenizer::from_file(&tokenizer_path) {
            Ok(tokenizer) => {
                self.tokenizer = Some(tokenizer);
                log::info!("✅ Tokenizer loaded successfully from {}", tokenizer_path.display());
            }
            Err(e) => {
                let error_msg = format!("Failed to load tokenizer from {}: {}", tokenizer_path.display(), e);
                log::error!("{}", error_msg);
                return Err(error_msg);
            }
        }

        // Load Gemma model configuration
        let config_path = normalized_path.join("config.json");
        log::info!("🔍 Looking for config at: {}", config_path.display());
        let config_data = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config from {}: {}", config_path.display(), e))?;
        let config: Config = serde_json::from_str(&config_data)
            .map_err(|e| format!("Failed to parse config: {}", e))?;

        // Load model weights from safetensors
        let model_path_weights = normalized_path.join("model.safetensors");
        log::info!("🔍 Looking for weights at: {}", model_path_weights.display());
        let tensors = candle_core::safetensors::load(&model_path_weights, &self.device)
            .map_err(|e| format!("Failed to load safetensors from {}: {}", model_path_weights.display(), e))?;
        let vb = VarBuilder::from_tensors(tensors, candle_core::DType::F32, &self.device);

        // Create the Gemma model
        let model = Model::new(false, &config, vb)
            .map_err(|e| format!("Failed to create Gemma model: {}", e))?;

        self.model = Some(model);
        self.is_initialized = true;
        log::info!("✅ Addy AI with full Gemma 2B model loaded successfully!");

        Ok(())
    }


}

// Helper function to generate response without holding mutex
async fn generate_response_impl(
    context: ConversationContext,
    personality: AddyPersonality,
) -> Result<AddyResponse, String> {
    // Use personality engine to analyze safety and build prompt
    let (safety_level, _triggers, _category) = personality.analyze_safety(&context.user_message);
    let system_prompt = personality.build_contextual_prompt(&context);

    // Build conversation for model
    let mut conversation = system_prompt;

    // Add conversation history
    if let Some(history) = &context.conversation_history {
        for msg in history.iter().take(6) { // Last 6 messages
            conversation.push_str(&format!("\n{}: {}",
                if msg.role == "user" { "Human" } else { "Assistant" },
                msg.content
            ));
        }
    }

    // Add current user message
    conversation.push_str(&format!("\nHuman: {}\nAssistant:", context.user_message));

    // TODO: Implement actual Candle model inference here
    // For now, return a response that shows the personality engine is working
    let ai_response = format!(
        "I hear you saying: '{}'. I'm processing this with my personality engine (safety level: {}) and will have my full Candle-powered brain working soon! 🤖💜",
        context.user_message,
        safety_level
    );

    // Determine tone based on safety level
    let tone = match safety_level.as_str() {
        "intervention" | "emergency" => "protective",
        "concern" => "gentle_firm",
        _ => "supportive",
    };

    // Build resources for safety concerns
    let resources = if safety_level != "safe" {
        Some(vec![
            "Crisis Text Line: Text HOME to 741741".to_string(),
            "988 Suicide & Crisis Lifeline".to_string(),
        ])
    } else {
        None
    };

    let response = AddyResponse {
        message: ai_response,
        safety_level: safety_level.clone(),
        suggested_actions: if safety_level != "safe" {
            Some(vec!["Consider reaching out for support".to_string()])
        } else {
            None
        },
        resources,
        follow_up_needed: safety_level != "safe",
        tone: tone.to_string(),
    };

    Ok(response)
}

// Global AI engine state
pub type AIEngineState = Mutex<AIEngine>;

// Tauri commands
#[tauri::command]
pub async fn initialize_ai(
    app: AppHandle,
    ai_engine: State<'_, AIEngineState>,
) -> Result<bool, String> {
    // For development, use the src-tauri directory
    // For production, this will be in the bundled resources
    let model_path = if cfg!(debug_assertions) {
        // Development path - models are in target/debug/models
        let exe_dir = std::env::current_exe()
            .map_err(|e| format!("Failed to get exe path: {}", e))?
            .parent()
            .ok_or("Failed to get exe parent directory")?
            .to_path_buf();
        exe_dir.join("models").join("gemma-2b-bnb-4bit")
    } else {
        // Production path - use resource directory
        let resource_dir = app.path().resource_dir()
            .map_err(|e| format!("Failed to get resource directory: {}", e))?;
        resource_dir.join("models").join("gemma-2b-bnb-4bit")
    };

    log::info!("🔍 Looking for model at: {}", model_path.display());

    // Verify the model directory exists
    if !model_path.exists() {
        return Err(format!("Model directory not found at: {}", model_path.display()));
    }

    // Create a new engine and initialize it
    let mut new_engine = AIEngine::new();
    new_engine.initialize(model_path.to_str().unwrap()).await?;

    // Replace the engine in the state
    {
        let mut engine = ai_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
        *engine = new_engine;
    }

    Ok(true)
}

#[tauri::command]
pub async fn generate_ai_response(
    context: ConversationContext,
    ai_engine: State<'_, AIEngineState>,
) -> Result<AddyResponse, String> {
    // Clone the necessary data to avoid holding the lock across await
    let (is_initialized, personality) = {
        let engine = ai_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
        (engine.is_initialized, engine.personality.clone())
    };

    if !is_initialized {
        return Err("AI engine not initialized".to_string());
    }

    // Generate response without holding the lock
    generate_response_impl(context, personality).await
}

#[tauri::command]
pub async fn is_ai_ready(ai_engine: State<'_, AIEngineState>) -> Result<bool, String> {
    let engine = ai_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(engine.is_initialized)
}
