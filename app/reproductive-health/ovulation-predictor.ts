/**
 * OVULATION PREDICTION ENGINE 🧠✨
 * 
 * Smart algorithm that learns from cycle data to predict ovulation
 * Gets smarter with more data - starts basic, becomes genius!
 */

import { ReproductiveHealthEntry } from './reproductive-health-tracker'

export interface OvulationPrediction {
  predictedDay: number | null
  confidence: 'low' | 'medium' | 'high' | 'confirmed'
  method: 'cycle-length' | 'bbt-pattern' | 'opk-surge' | 'cervical-fluid' | 'combined'
  fertileWindowStart: number | null
  fertileWindowEnd: number | null
  daysUntilOvulation: number | null
  message: string
  isLate: boolean // If we're past predicted ovulation without confirmation
}

export interface CycleData {
  cycleLength: number
  ovulationDay: number | null
  lutealPhaseLength: number | null
  entries: ReproductiveHealthEntry[]
}

export class OvulationPredictor {
  
  /**
   * Main prediction function - the fertility brain! 🧠
   */
  static predictOvulation(
    currentCycleDay: number,
    currentCycleEntries: ReproductiveHealthEntry[],
    historicalCycles: CycleData[]
  ): OvulationPrediction {
    
    // Start with basic cycle math
    let prediction = this.getBasicPrediction(currentCycleDay, historicalCycles)
    
    // Enhance with BBT analysis
    const bbtPrediction = this.analyzeBBTPattern(currentCycleEntries)
    if (bbtPrediction.confidence !== 'low') {
      prediction = this.combinePredictions(prediction, bbtPrediction)
    }
    
    // Enhance with OPK data
    const opkPrediction = this.analyzeOPKPattern(currentCycleEntries, currentCycleDay)
    if (opkPrediction.confidence !== 'low') {
      prediction = this.combinePredictions(prediction, opkPrediction)
    }
    
    // Enhance with cervical fluid
    const fluidPrediction = this.analyzeCervicalFluid(currentCycleEntries, currentCycleDay)
    if (fluidPrediction.confidence !== 'low') {
      prediction = this.combinePredictions(prediction, fluidPrediction)
    }
    
    // Check if we're past predicted ovulation
    prediction.isLate = this.checkIfLate(prediction, currentCycleDay)
    
    return prediction
  }
  
  /**
   * Basic cycle length prediction - where we start! 📅
   */
  private static getBasicPrediction(currentCycleDay: number, historicalCycles: CycleData[]): OvulationPrediction {
    // No default assumptions - use actual data or intelligent estimates
    let avgCycleLength: number | null = null
    let avgOvulationDay: number | null = null
    
    if (historicalCycles.length > 0) {
      // Learn from user's actual cycles
      const validCycles = historicalCycles.filter(c => c.cycleLength > 0)
      if (validCycles.length > 0) {
        avgCycleLength = Math.round(validCycles.reduce((sum, c) => sum + c.cycleLength, 0) / validCycles.length)

        // If we have confirmed ovulation days, use those
        const ovulationCycles = validCycles.filter(c => c.ovulationDay !== null)
        if (ovulationCycles.length > 0) {
          avgOvulationDay = Math.round(ovulationCycles.reduce((sum, c) => sum + c.ovulationDay!, 0) / ovulationCycles.length)
        } else {
          // Estimate: ovulation typically 12-16 days before next period
          avgOvulationDay = Math.max(10, avgCycleLength - 14)
        }
      }
    }

    // If no historical data, we can't make reliable predictions
    if (avgOvulationDay === null) {
      return {
        predictedDay: null,
        confidence: 'low',
        method: 'cycle-length',
        fertileWindowStart: null,
        fertileWindowEnd: null,
        daysUntilOvulation: null,
        message: 'Need more cycle data for predictions. Track a few cycles to get started! 📊',
        isLate: false
      }
    }

    const daysUntil = avgOvulationDay - currentCycleDay
    
    return {
      predictedDay: avgOvulationDay,
      confidence: historicalCycles.length >= 3 ? 'medium' : 'low',
      method: 'cycle-length',
      fertileWindowStart: Math.max(1, avgOvulationDay - 5),
      fertileWindowEnd: avgOvulationDay + 1,
      daysUntilOvulation: daysUntil > 0 ? daysUntil : null,
      message: daysUntil > 0 
        ? `Predicted ovulation in ${daysUntil} days (day ${avgOvulationDay})`
        : daysUntil === 0
        ? `Predicted ovulation TODAY! 🥚✨`
        : `Predicted ovulation was ${Math.abs(daysUntil)} days ago`,
      isLate: false
    }
  }
  
  /**
   * BBT Pattern Analysis - the temperature detective! 🌡️
   */
  private static analyzeBBTPattern(entries: ReproductiveHealthEntry[], currentDay: number): OvulationPrediction {
    const bbtEntries = entries
      .filter(e => e.bbt !== null && e.bbt !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (bbtEntries.length < 6) {
      return { predictedDay: null, confidence: 'low', method: 'bbt-pattern', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'Need more BBT data', isLate: false }
    }
    
    // Look for temperature shift (3+ consecutive temps 0.2°F+ higher)
    const recentTemps = bbtEntries.slice(-10) // Last 10 days
    
    for (let i = 3; i < recentTemps.length; i++) {
      const currentTemp = recentTemps[i].bbt!
      const previousTemps = recentTemps.slice(i-3, i).map(e => e.bbt!)
      const avgPrevious = previousTemps.reduce((sum, temp) => sum + temp, 0) / previousTemps.length
      
      // Check if current temp is significantly higher
      if (currentTemp >= avgPrevious + 0.2) {
        // Check if this pattern continues
        const followingTemps = recentTemps.slice(i, i+3)
        const allHigher = followingTemps.every(e => e.bbt! >= avgPrevious + 0.2)
        
        if (allHigher && followingTemps.length >= 2) {
          // Ovulation likely occurred 1-2 days before temp rise
          const ovulationEntry = recentTemps[i-1]
          const ovulationDay = this.getEntryDayOfCycle(ovulationEntry)
          
          return {
            predictedDay: ovulationDay,
            confidence: 'confirmed',
            method: 'bbt-pattern',
            fertileWindowStart: Math.max(1, ovulationDay - 5),
            fertileWindowEnd: ovulationDay + 1,
            daysUntilOvulation: null,
            message: `Ovulation CONFIRMED by BBT pattern! Occurred around day ${ovulationDay} 🌡️✅`,
            isLate: false
          }
        }
      }
    }
    
    return { predictedDay: null, confidence: 'low', method: 'bbt-pattern', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'No BBT shift detected yet', isLate: false }
  }
  
  /**
   * OPK Analysis - the surge detector! 🧪
   */
  private static analyzeOPKPattern(entries: ReproductiveHealthEntry[], currentDay: number): OvulationPrediction {
    const opkEntries = entries
      .filter(e => e.opk !== null && e.opk !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (opkEntries.length === 0) {
      return { predictedDay: null, confidence: 'low', method: 'opk-surge', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'No OPK data yet', isLate: false }
    }
    
    // Look for peak OPK result
    const recentOPKs = opkEntries.slice(-5) // Last 5 tests
    const peakResult = recentOPKs.find(e => e.opk === 'peak')
    
    if (peakResult) {
      const peakDay = this.getEntryDayOfCycle(peakResult)
      const ovulationDay = peakDay + 1 // Ovulation typically 12-36 hours after peak
      const daysUntil = ovulationDay - currentDay
      
      return {
        predictedDay: ovulationDay,
        confidence: 'high',
        method: 'opk-surge',
        fertileWindowStart: Math.max(1, peakDay - 2),
        fertileWindowEnd: ovulationDay + 1,
        daysUntilOvulation: daysUntil > 0 ? daysUntil : null,
        message: daysUntil > 0 
          ? `OPK PEAK detected! Ovulation expected in ${daysUntil} days 🧪🎯`
          : `OPK peak was ${Math.abs(daysUntil)} days ago - ovulation likely occurred!`,
        isLate: false
      }
    }
    
    // Look for high OPK (approaching surge)
    const highResult = recentOPKs.find(e => e.opk === 'high')
    if (highResult) {
      const highDay = this.getEntryDayOfCycle(highResult)
      console.log('🧪 OPK ANALYSIS DEBUG:')
      console.log('  - HIGH OPK entry:', highResult)
      console.log('  - Calculated highDay:', highDay)
      console.log('  - currentDay passed:', currentDay)
      console.log('  - predictedDay:', highDay + 2)
      console.log('  - daysUntilOvulation calc:', `(${highDay} + 2) - ${currentDay} = ${(highDay + 2) - currentDay}`)

      return {
        predictedDay: highDay + 2,
        confidence: 'medium',
        method: 'opk-surge',
        fertileWindowStart: Math.max(1, highDay - 1),
        fertileWindowEnd: highDay + 3,
        daysUntilOvulation: (highDay + 2) - currentDay,
        message: `OPK showing HIGH - surge approaching! 🧪📈`,
        isLate: false
      }
    }
    
    return { predictedDay: null, confidence: 'low', method: 'opk-surge', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'No OPK surge detected yet', isLate: false }
  }
  
  /**
   * Cervical Fluid Analysis - the fertility fluid detective! 💧
   */
  private static analyzeCervicalFluid(entries: ReproductiveHealthEntry[], currentDay: number): OvulationPrediction {
    const fluidEntries = entries
      .filter(e => e.cervicalFluid && e.cervicalFluid !== '')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (fluidEntries.length === 0) {
      return { predictedDay: null, confidence: 'low', method: 'cervical-fluid', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'No cervical fluid data', isLate: false }
    }
    
    // Look for egg-white consistency (peak fertility)
    const recentFluid = fluidEntries.slice(-7) // Last week
    const eggWhiteDay = recentFluid.find(e => e.cervicalFluid === 'egg-white')
    
    if (eggWhiteDay) {
      const eggWhiteDate = this.getEntryDayOfCycle(eggWhiteDay)
      const ovulationDay = eggWhiteDate + 1 // Ovulation typically day of or day after peak fluid
      const daysUntil = ovulationDay - currentDay
      
      return {
        predictedDay: ovulationDay,
        confidence: 'medium',
        method: 'cervical-fluid',
        fertileWindowStart: Math.max(1, eggWhiteDate - 2),
        fertileWindowEnd: ovulationDay + 1,
        daysUntilOvulation: daysUntil > 0 ? daysUntil : null,
        message: daysUntil > 0 
          ? `Egg-white fluid detected! Ovulation expected in ${daysUntil} days 💧🥚`
          : `Peak fertile fluid was ${Math.abs(daysUntil)} days ago`,
        isLate: false
      }
    }
    
    return { predictedDay: null, confidence: 'low', method: 'cervical-fluid', fertileWindowStart: null, fertileWindowEnd: null, daysUntilOvulation: null, message: 'No peak fertile fluid yet', isLate: false }
  }
  
  /**
   * Combine multiple predictions - the wisdom synthesizer! 🧠✨
   */
  private static combinePredictions(pred1: OvulationPrediction, pred2: OvulationPrediction): OvulationPrediction {
    // Prioritize confirmed predictions
    if (pred2.confidence === 'confirmed') return pred2
    if (pred1.confidence === 'confirmed') return pred1
    
    // Combine high confidence predictions
    if (pred1.confidence === 'high' && pred2.confidence === 'high') {
      const avgDay = Math.round(((pred1.predictedDay || 0) + (pred2.predictedDay || 0)) / 2)
      return {
        ...pred1,
        predictedDay: avgDay,
        method: 'combined',
        message: `Multiple signals point to ovulation around day ${avgDay}! 🎯✨`
      }
    }
    
    // Return the higher confidence prediction
    const confidenceOrder = { 'confirmed': 4, 'high': 3, 'medium': 2, 'low': 1 }
    return confidenceOrder[pred2.confidence] > confidenceOrder[pred1.confidence] ? pred2 : pred1
  }
  
  /**
   * Check if we're past predicted ovulation without confirmation
   */
  private static checkIfLate(prediction: OvulationPrediction, currentDay: number): boolean {
    if (!prediction.predictedDay || prediction.confidence === 'confirmed') return false
    return currentDay > prediction.predictedDay + 2 // 2 days past prediction
  }
  
  /**
   * Helper to get cycle day from entry - needs to match BBT chart calculation
   */
  private static getEntryDayOfCycle(entry: ReproductiveHealthEntry): number {
    // For now, we'll estimate based on current cycle day calculation
    // This should match the cycle day calculation from bbt-chart.tsx
    const entryDate = new Date(entry.date)
    const today = new Date()
    const daysSinceToday = Math.floor((entryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Assume current day 13 (matching bbt-chart.tsx logic)
    const estimatedCurrentDay = 13
    return Math.max(1, estimatedCurrentDay + daysSinceToday)
  }
}
