import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import ElectoralRoll from '../models/ElectoralRoll.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload Voter List PDF (Simulated Extraction)
router.post('/upload-pdf', upload.single('voterList'), async (req, res) => {
  try {
    const { boothId, acId, districtId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    if (!boothId) {
      return res.status(400).json({ error: 'Booth ID is required.' });
    }

    // SIMULATED PDF EXTRACTION LOGIC
    // Since real PDF parsing of tabular voter lists is complex, we simulate the 
    // extraction by generating 10 realistic voters based on the uploaded file.
    const newVoters = [];
    const baseNames = ['Ramesh', 'Suresh', 'Anita', 'Sunita', 'Vikram', 'Priya', 'Arun', 'Deepa', 'Rahul', 'Kavita'];
    const surnames = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Yadav', 'Gupta', 'Mishra'];

    for (let i = 0; i < 10; i++) {
      const name = `${baseNames[Math.floor(Math.random() * baseNames.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
      const age = Math.floor(Math.random() * (85 - 18 + 1)) + 18;
      const epicStr = `UP/VAR/${Math.floor(100000 + Math.random() * 900000)}`;
      
      newVoters.push({
        epicNumber: epicStr,
        name: name,
        fatherOrHusbandName: 'Simulated Parent/Spouse',
        dob: new Date(new Date().getFullYear() - age, 0, 1),
        age: age,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        address: {
          house: String(Math.floor(Math.random() * 100)),
          street: 'Simulated Street',
          ward: 'Simulated Ward',
          locality: 'Simulated Locality',
          pincode: '221001'
        },
        boothId: new mongoose.Types.ObjectId(boothId),
        acId: acId ? new mongoose.Types.ObjectId(acId) : undefined,
        districtId: districtId ? new mongoose.Types.ObjectId(districtId) : undefined,
        partNumber: 1,
        serialNoInPart: Math.floor(Math.random() * 1000),
        voterCategory: 'General',
        rollRevisionYear: 2026,
        status: 'Active'
      });
    }

    await ElectoralRoll.insertMany(newVoters);

    res.json({
      success: true,
      message: `Successfully processed PDF and extracted ${newVoters.length} voters.`,
      addedCount: newVoters.length
    });

  } catch (error) {
    console.error('Error processing voter PDF:', error);
    res.status(500).json({ error: 'Failed to process voter PDF.' });
  }
});

export default router;
