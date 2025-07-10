"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import Image from "next/image"

// Gremlinisms from Cares
const uncheckedGoblinPhrases = [
  "Mark this box when your chaos goblin survives another day.",
  "Click when you've made it through. No achievements needed.",
  "Survived today? The checkbox awaits your triumph.",
  "Did you exist today? That's checkbox-worthy.",
  "Goblin still breathing? Check when ready.",
  "Your daily defiance of entropy deserves a check.",
  "Acknowledge your continued existence when ready.",
  "The goblin awaits news of your survival.",
  "Check when your meat suit has completed another rotation.",
  "Survived the day? The checkbox craves your validation.",
]

const goblinPhrases = [
  "You're still alive? That's literally a power move.",
  "Your body is loud, your brain is weird, and you showed up anyway.",
  "Today's quest: survive and vibe. You win by existing.",
  "Your bones are confused but your heart's a gremlin war drum.",
  "Behold, the goblin approves your semi-functional chaos.",
  "Brushed your teeth? Took your meds? You absolute legend.",
  "You are made of spite and snacks and you are beautiful.",
  "The world is wild, but your chaos is holy.",
  "You did not perish. The streak continues.",
  "You're allowed to do nothing. That counts as something.",
  "Executive dysfunction isn't a flaw—it's an enchantment delay.",
]

// Normal people affirmations (not condescending)
const normalAffirmations = [
  "You are surviving, and that is amazing.",
  "Every day you keep going is a victory.",
  "Your resilience is quietly extraordinary.",
  "You matter, especially on the hard days.",
  "Taking care of yourself is an act of courage.",
  "You're doing better than you think you are.",
  "Your existence makes the world a little brighter.",
  "Rest is productive. Healing takes time.",
  "You don't have to be perfect to be worthy.",
  "Small steps still count as progress.",
  "You are enough, exactly as you are.",
]

// Array of familiar images for rotation
const familiars = [
  '/familiars/cheer.png',
  '/familiars/owl.png',
  '/familiars/puppy.png',
  '/familiars/racoon.png',
  '/familiars/robot.png',
  '/familiars/unicorn.png'
]

export default function SurvivalButton() {
  const [checked, setChecked] = useState(false)
  const [count, setCount] = useState(0)
  const [lastCheckedDate, setLastCheckedDate] = useState("")
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [currentLabelPhrase, setCurrentLabelPhrase] = useState("")
  const [phraseType, setPhraseType] = useState<'goblin' | 'normal'>('goblin')
  const [showGremlin, setShowGremlin] = useState(false)
  const [currentFamiliar, setCurrentFamiliar] = useState(familiars[0])

  // Load saved state
  useEffect(() => {
    const savedChecked = localStorage.getItem("survivalChecked")
    const savedCount = localStorage.getItem("survivalCount")
    const savedDate = localStorage.getItem("lastCheckedDate")

    // Use local time instead of UTC to properly handle midnight reset
    const today = new Date()
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Only keep checkbox checked if it was checked today
    if (savedChecked && savedDate === localToday) {
      setChecked(savedChecked === "true")
    } else {
      // Reset checkbox for new day
      setChecked(false)
      localStorage.setItem("survivalChecked", "false")
    }

    if (savedCount) setCount(parseInt(savedCount))
    if (savedDate) setLastCheckedDate(savedDate)

    // Set initial phrases (deterministic to avoid hydration issues)
    const phraseIndex = (savedCount ? parseInt(savedCount) : 0) % uncheckedGoblinPhrases.length
    setCurrentPhrase(uncheckedGoblinPhrases[phraseIndex])
    setCurrentLabelPhrase(uncheckedGoblinPhrases[phraseIndex])
  }, [])

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  const cyclePhrase = useCallback(() => {
    if (checked) {
      // Cycle between goblin and normal affirmations
      const newType = phraseType === 'goblin' ? 'normal' : 'goblin'
      setPhraseType(newType)

      if (newType === 'goblin') {
        const phraseIndex = count % goblinPhrases.length
        setCurrentPhrase(goblinPhrases[phraseIndex])
      } else {
        const phraseIndex = count % normalAffirmations.length
        setCurrentPhrase(normalAffirmations[phraseIndex])
      }
    } else {
      // Cycle through unchecked phrases
      const phraseIndex = count % uncheckedGoblinPhrases.length
      setCurrentPhrase(uncheckedGoblinPhrases[phraseIndex])
    }
  }, [checked, phraseType, count])



  const handleCheckboxChange = useCallback(() => {
    const newChecked = !checked

    // Use local time instead of UTC
    const todayDate = new Date()
    const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`

    setChecked(newChecked)
    localStorage.setItem("survivalChecked", newChecked.toString())

    let currentCount = count
    if (newChecked) {
      // Only increment count if it's a new day
      if (lastCheckedDate !== today && !checked) {
        currentCount = count + 1
        setCount(currentCount)
        localStorage.setItem("survivalCount", currentCount.toString())
        setLastCheckedDate(today)
        localStorage.setItem("lastCheckedDate", today)
      }

      // Trigger confetti celebration!
      triggerConfetti()

      // Show the cheerleading familiar! (deterministic selection)
      const familiarIndex = currentCount % familiars.length
      setCurrentFamiliar(familiars[familiarIndex])
      setShowGremlin(true)
      setTimeout(() => {
        setShowGremlin(false)
      }, 2500)

      // Set initial checked phrase
      const phraseIndex = currentCount % goblinPhrases.length
      setCurrentPhrase(goblinPhrases[phraseIndex])
      setPhraseType('goblin')
    } else {
      // Set unchecked phrase
      const phraseIndex = currentCount % uncheckedGoblinPhrases.length
      setCurrentPhrase(uncheckedGoblinPhrases[phraseIndex])
      setCurrentLabelPhrase(uncheckedGoblinPhrases[phraseIndex])
    }
  }, [checked, count, lastCheckedDate, triggerConfetti])

  // State for today's date to avoid hydration issues
  const [today, setToday] = useState('')

  useEffect(() => {
    // Set date on client side only
    const date = new Date()
    setToday(date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  return (
    <div className="relative">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground whitespace-nowrap">Today's Survival Check</h3>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>



        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleCheckboxChange}
              variant={checked ? "default" : "outline"}
              size="lg"
              className={`
                relative min-w-[60px] h-[60px] rounded-xl transition-all duration-300
                ${checked
                  ? 'bg-green-500 hover:bg-green-600 border-green-500 shadow-lg shadow-green-500/25'
                  : 'border-2 border-dashed border-muted-foreground/30 hover:border-primary'
                }
              `}
            >
              {checked ? (
                <Check className="h-6 w-6 text-white" />
              ) : (
                <div className="w-6 h-6 border-2 border-muted-foreground/50 rounded" />
              )}
              {checked && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </Button>

            <Badge variant="secondary" className="text-xs">
              {count} days survived
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            {!checked ? (
              <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <p className="text-pink-700 dark:text-pink-300 font-medium text-lg mb-2">
                  If you just <strong>CAN'T</strong> today, that's OK.
                </p>
                <p className="text-pink-600 dark:text-pink-400 text-sm">
                  Check this box ☐ as a mark of surviving another day, and know you did it!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  🎉 {currentPhrase}
                </p>
              </div>
            )}

            {!checked && (
              <p className="text-sm text-muted-foreground italic">
                {currentLabelPhrase}
              </p>
            )}
          </div>
        </div>

        {checked && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              🎉 {currentPhrase}
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* CHEERLEADING FAMILIAR! */}
    {showGremlin && (
      <div className="absolute top-16 right-4 z-10">
        <div className="drop-shadow-lg animate-bounce">
          <Image
            src={currentFamiliar}
            alt="Cheerleading familiar"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
    )}
  </div>
  )
}
