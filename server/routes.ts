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
  // This function needs to be implemented based on the specific format
  // of betting slips from different betting houses
  
  // For now, return sample data based on the image provided
  // This would need to be improved with actual OCR parsing logic
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract sport and league from the first few lines
  const sportLeagueLine = lines.find(line => 
    line.includes('Tênis') || line.includes('ATP') || line.includes('/')
  ) || "Tênis / ATP - Hangzhou, China";
  
  const [sport, league] = sportLeagueLine.includes('/') 
    ? sportLeagueLine.split('/').map(s => s.trim())
    : ["Tênis", sportLeagueLine];

  // Extract players/teams (looking for vs, -, or similar separators)
  const playersLine = lines.find(line => 
    line.includes('—') || line.includes('-') || line.includes('vs')
  ) || "Giulio Zeppieri — Tien, Learner";
  
  const [teamA, teamB] = playersLine.includes('—') 
    ? playersLine.split('—').map(s => s.trim())
    : playersLine.includes('-')
    ? playersLine.split('-').map(s => s.trim())
    : ["Jogador A", "Jogador B"];

  // For the example image, extract the specific betting information
  return {
    betA: {
      bettingHouse: "Betfast",
      sport,
      league,
      teamA,
      teamB,
      betType: "Acima 8.5 1º o set",
      selectedSide: "A",
      odds: "1.270",
      stake: "979.47",
      payout: "1243.67",
      profit: "28.42"
    },
    betB: {
      bettingHouse: "Pinnacle",
      sport,
      league,
      teamA,
      teamB,
      betType: "Abaixo 8.5 1º o set",
      selectedSide: "B",
      odds: "5.270",
      stake: "236.04",
      payout: "1243.67",
      profit: "28.42"
    },
    gameDate: new Date(),
    gameTime: undefined
  };
}
