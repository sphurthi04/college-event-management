/**
 * College Controller
 * Admin manages the list of colleges
 */

const College = require('../models/College');

const getColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCollege = async (req, res) => {
  try {
    const { name, location, email, phone, website } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'College name is required' });
    const college = await College.create({ name, location, email, phone, website });
    res.status(201).json({ success: true, data: college, message: 'College added successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'College already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, data: college, message: 'College updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCollege = async (req, res) => {
  try {
    await College.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'College removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getColleges, createCollege, updateCollege, deleteCollege };
