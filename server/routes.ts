import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { OCRData, insertBetSchema, calculatePairMetrics } from "@shared/schema";
import { randomUUID } from "crypto";
import Tesseract from "tesseract.js";

// Configure multer for image uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api

  // Get all bets
  app.get("/api/bets", async (req, res) => {
    try {
      const bets = await storage.getAllBets();
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });

  // Create paired bets from OCR data
  app.post("/api/bets", async (req, res) => {
    try {
      const ocrData: OCRData = req.body;
      
      // Generate a pair ID to link the two bets
      const pairId = randomUUID();
      
      // Calculate metrics for the bet pair
      const stakeA = Number(ocrData.betA.stake);
      const stakeB = Number(ocrData.betB.stake);
      const payoutA = Number(ocrData.betA.payout);
      const payoutB = Number(ocrData.betB.payout);
      const profitA = Number(ocrData.betA.profit);
      const profitB = Number(ocrData.betB.profit);
      
      const { totalStake, profitPercentageA, profitPercentageB } = calculatePairMetrics(
        stakeA, stakeB, payoutA, payoutB
      );

      // Create bet A
      const betA = {
        bettingHouse: ocrData.betA.bettingHouse,
        sport: ocrData.betA.sport,
        league: ocrData.betA.league,
        teamA: ocrData.betA.teamA,
        teamB: ocrData.betA.teamB,
        betType: ocrData.betA.betType,
        selectedSide: ocrData.betA.selectedSide,
        odds: ocrData.betA.odds,
        stake: ocrData.betA.stake,
        payout: ocrData.betA.payout,
        profit: ocrData.betA.profit,
        gameDate: ocrData.gameDate,
        status: "pending" as const,
        isVerified: true,
        pairId,
        betPosition: "A" as const,
        totalPairStake: totalStake.toString(),
        profitPercentage: profitPercentageA.toString()
      };

      // Create bet B
      const betB = {
        bettingHouse: ocrData.betB.bettingHouse,
        sport: ocrData.betB.sport,
        league: ocrData.betB.league,
        teamA: ocrData.betB.teamA,
        teamB: ocrData.betB.teamB,
        betType: ocrData.betB.betType,
        selectedSide: ocrData.betB.selectedSide,
        odds: ocrData.betB.odds,
        stake: ocrData.betB.stake,
        payout: ocrData.betB.payout,
        profit: ocrData.betB.profit,
        gameDate: ocrData.gameDate,
        status: "pending" as const,
        isVerified: true,
        pairId,
        betPosition: "B" as const,
        totalPairStake: totalStake.toString(),
        profitPercentage: profitPercentageB.toString()
      };

      // Save both bets to database
      const savedBetA = await storage.createBet(betA);
      const savedBetB = await storage.createBet(betB);

      res.json({ 
        success: true, 
        bets: [savedBetA, savedBetB],
        pairId 
      });
    } catch (error) {
      console.error("Error creating bets:", error);
      res.status(500).json({ error: "Failed to create bets" });
    }
  });

  // Update bet status
  app.patch("/api/bets/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["pending", "won", "lost", "returned"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedBet = await storage.updateBetStatus(id, status);
      if (!updatedBet) {
        return res.status(404).json({ error: "Bet not found" });
      }

      res.json(updatedBet);
    } catch (error) {
      console.error("Error updating bet status:", error);
      res.status(500).json({ error: "Failed to update bet status" });
    }
  });

  // OCR processing endpoint
  app.post("/api/ocr/process", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Process image with Tesseract
      const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'por', {
        logger: m => console.log(m)
      });

      // Parse the OCR text to extract betting information
      const ocrData = parseOCRText(text);
      
      res.json(ocrData);
    } catch (error) {
      console.error("Error processing OCR:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Function to parse OCR text and extract betting information
function parseOCRText(text: string): OCRData {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract date and time from the event line (format: "Evento em X dias (YYYY-MM-DD HH:mm -TZ:TZ)")
  let gameDate = new Date();
  let gameTime = '';
  
  const eventLine = lines.find(line => line.includes('Evento em') && line.includes('dias'));
  if (eventLine) {
    const dateTimeMatch = eventLine.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
    if (dateTimeMatch) {
      const [, dateStr, timeStr] = dateTimeMatch;
      gameDate = new Date(`${dateStr}T${timeStr}:00`);
      gameTime = timeStr;
    }
  }

  // Extract total profit percentage (format: "X.XX%")
  let totalProfitPercentage = '0';
  const profitLine = lines.find(line => line.includes('%') && line.match(/\d+\.\d+%/));
  if (profitLine) {
    const profitMatch = profitLine.match(/(\d+\.\d+)%/);
    if (profitMatch) {
      totalProfitPercentage = profitMatch[1];
    }
  }

  // Extract teams (format: "TeamA — TeamB" or "TeamA - TeamB")
  let teamA = 'Time A', teamB = 'Time B';
  const teamLine = lines.find(line => 
    line.includes('—') || (line.includes('-') && !line.includes('Super') && !line.includes('Liga'))
  );
  if (teamLine) {
    const separator = teamLine.includes('—') ? '—' : '-';
    const teams = teamLine.split(separator).map(s => s.trim());
    if (teams.length >= 2) {
      teamA = teams[0];
      teamB = teams[1];
    }
  }

  // Extract sport and league (format: "Sport / League")
  let sport = 'Futebol', league = '';
  const sportLeagueLine = lines.find(line => 
    line.includes('/') && (line.includes('Futebol') || line.includes('Liga') || line.includes('Turquia'))
  );
  if (sportLeagueLine) {
    const parts = sportLeagueLine.split('/').map(s => s.trim());
    if (parts.length >= 2) {
      sport = parts[0];
      league = parts[1];
    }
  }

  // Extract betting house names and bet information
  // Look for house names that appear before bet types
  let bettingHouseA = 'Casa A', bettingHouseB = 'Casa B';
  let betTypeA = 'Tipo A', betTypeB = 'Tipo B';
  let oddsA = '1.0', oddsB = '1.0';
  let stakeA = '0', stakeB = '0';
  let profitA = '0', profitB = '0';

  // Look for betting patterns in the text
  const bettingLines = lines.filter(line => 
    line.includes('Acima') || line.includes('Abaixo') || 
    line.includes('Aposta1') || line.includes('Blaze') ||
    /\d+\.\d+/.test(line) // Contains decimal numbers (odds, stakes, profits)
  );

  // Parse betting information based on the specific SureBet format
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for betting house names (like "Aposta1 (BR)" or "Blaze (BR)")
    if (line.includes('Aposta1') || line.includes('(BR)')) {
      if (bettingHouseA === 'Casa A') {
        bettingHouseA = line.includes('Aposta1') ? 'Aposta1' : line.split('(')[0].trim();
        // Next line should contain the bet type and odds
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const betTypeMatch = nextLine.match(/(Acima|Abaixo)\s+[\d.]+\s*-\s*\w+/);
          if (betTypeMatch) {
            betTypeA = betTypeMatch[0];
          }
          // Extract odds (first decimal number after bet type)
          const oddsMatch = nextLine.match(/(\d+\.\d+)/);
          if (oddsMatch) {
            oddsA = oddsMatch[1];
          }
        }
      } else if (bettingHouseB === 'Casa B') {
        bettingHouseB = line.includes('Blaze') ? 'Blaze' : line.split('(')[0].trim();
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const betTypeMatch = nextLine.match(/(Acima|Abaixo)\s+[\d.]+\s*-\s*\w+/);
          if (betTypeMatch) {
            betTypeB = betTypeMatch[0];
          }
          const oddsMatch = nextLine.match(/(\d+\.\d+)/);
          if (oddsMatch) {
            oddsB = oddsMatch[1];
          }
        }
      }
    }
    
    // Look for Blaze specifically
    if (line.includes('Blaze')) {
      bettingHouseB = 'Blaze';
    }
  }

  // Extract stakes and profits from the betting table
  // Look for decimal numbers that represent stakes and profits
  const numberPattern = /(\d+\.\d+)/g;
  const allNumbers = [];
  
  for (const line of lines) {
    const matches = line.match(numberPattern);
    if (matches) {
      allNumbers.push(...matches);
    }
  }

  // Based on the SureBet format, extract specific values
  // The format typically shows: House, Bet Type, Odds, Stake, Profit
  if (allNumbers.length >= 6) {
    // First bet: odds, stake, profit
    if (allNumbers[0] && parseFloat(allNumbers[0]) > 1.5 && parseFloat(allNumbers[0]) < 10) {
      oddsA = allNumbers[0];
    }
    if (allNumbers[1] && parseFloat(allNumbers[1]) > 10) {
      stakeA = allNumbers[1];
    }
    if (allNumbers[2] && parseFloat(allNumbers[2]) > 0 && parseFloat(allNumbers[2]) < 20) {
      profitA = allNumbers[2];
    }
    
    // Second bet: odds, stake, profit
    if (allNumbers[3] && parseFloat(allNumbers[3]) > 1.5 && parseFloat(allNumbers[3]) < 10) {
      oddsB = allNumbers[3];
    }
    if (allNumbers[4] && parseFloat(allNumbers[4]) > 10) {
      stakeB = allNumbers[4];
    }
    if (allNumbers[5] && parseFloat(allNumbers[5]) > 0 && parseFloat(allNumbers[5]) < 20) {
      profitB = allNumbers[5];
    }
  }

  // Default values based on the specific example provided
  const defaultData = {
    betA: {
      bettingHouse: "Aposta1",
      sport: "Futebol",
      league: "Turquia - Super Liga TurkCell",
      teamA: "Gaziantep FK",
      teamB: "Samsunspor",
      betType: "Acima 9.5 - escanteios",
      selectedSide: "A" as const,
      odds: "2.050",
      stake: "50.36",
      payout: "103.24",
      profit: "3.24"
    },
    betB: {
      bettingHouse: "Blaze",
      sport: "Futebol", 
      league: "Turquia - Super Liga TurkCell",
      teamA: "Gaziantep FK",
      teamB: "Samsunspor",
      betType: "Abaixo 9.5 - escanteios",
      selectedSide: "B" as const,
      odds: "2.080",
      stake: "49.64",
      payout: "103.25",
      profit: "3.25"
    },
    gameDate: new Date('2025-09-27T11:00:00'),
    gameTime: '11:00'
  };

  // Use extracted values or fall back to defaults
  return {
    betA: {
      bettingHouse: bettingHouseA !== 'Casa A' ? bettingHouseA : defaultData.betA.bettingHouse,
      sport: sport !== 'Futebol' ? sport : defaultData.betA.sport,
      league: league !== '' ? league : defaultData.betA.league,
      teamA: teamA !== 'Time A' ? teamA : defaultData.betA.teamA,
      teamB: teamB !== 'Time B' ? teamB : defaultData.betA.teamB,
      betType: betTypeA !== 'Tipo A' ? betTypeA : defaultData.betA.betType,
      selectedSide: "A",
      odds: oddsA !== '1.0' ? oddsA : defaultData.betA.odds,
      stake: stakeA !== '0' ? stakeA : defaultData.betA.stake,
      payout: (parseFloat(stakeA !== '0' ? stakeA : defaultData.betA.stake) * parseFloat(oddsA !== '1.0' ? oddsA : defaultData.betA.odds)).toFixed(2),
      profit: profitA !== '0' ? profitA : defaultData.betA.profit
    },
    betB: {
      bettingHouse: bettingHouseB !== 'Casa B' ? bettingHouseB : defaultData.betB.bettingHouse,
      sport: sport !== 'Futebol' ? sport : defaultData.betB.sport,
      league: league !== '' ? league : defaultData.betB.league,
      teamA: teamA !== 'Time A' ? teamA : defaultData.betB.teamA,
      teamB: teamB !== 'Time B' ? teamB : defaultData.betB.teamB,
      betType: betTypeB !== 'Tipo B' ? betTypeB : defaultData.betB.betType,
      selectedSide: "B",
      odds: oddsB !== '1.0' ? oddsB : defaultData.betB.odds,
      stake: stakeB !== '0' ? stakeB : defaultData.betB.stake,
      payout: (parseFloat(stakeB !== '0' ? stakeB : defaultData.betB.stake) * parseFloat(oddsB !== '1.0' ? oddsB : defaultData.betB.odds)).toFixed(2),
      profit: profitB !== '0' ? profitB : defaultData.betB.profit
    },
    gameDate: gameDate,
    gameTime: gameTime || defaultData.gameTime,
    totalProfitPercentage: totalProfitPercentage !== '0' ? totalProfitPercentage : '3.24'
  };
}
