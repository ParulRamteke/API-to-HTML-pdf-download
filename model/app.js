const mongoose = require("mongoose");

// Define schema
const AgrolifeSchema = new mongoose.Schema({
    CLAIM_DATE: Date,
    START_KM: Number,
    END_KM: Number,
    MODE_OF_TRAVEL: String,
    OPENING_READING: Number,
    CLOSING_READING: Number,
    TOTAL_KM: Number,
    FUEL_CHARGES_PER: Number,
    EXP_FUEL: Number,
    EXP_BUS_TRAIN: Number,
    EXP_HOTEL: Number,
    DA_RATES_OUTST: Number,
    EXP_MOBILE_INTERNET: Number,
    EXP_MISC: Number,
    TOTAL_CLAIMED_AMOUNT: Number,
    REMARKS: String
}, { collection: 'Agrolife_table' });

// Create model based on the schema
const AGROMODEL = mongoose.model('Agrolife_table', AgrolifeSchema);

module.exports = AGROMODEL;
