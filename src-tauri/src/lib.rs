mod ai;

use ai::{AIEngine, AIEngineState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AIEngineState::new(AIEngine::new()))
    .invoke_handler(tauri::generate_handler![
      ai::initialize_ai,
      ai::generate_ai_response,
      ai::is_ai_ready
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
