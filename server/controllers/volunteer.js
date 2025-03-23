const Volunteer = require('../models/volunteer');
const mongoose = require('mongoose');
const NGO = require('../models/ngo');

// Get all volunteers for a specific NGO
const getNGOVolunteers = async (req, res) => {
    try {
        const { ngoId } = req.params;
        console.log('Fetching volunteers for NGO:', ngoId);

        if (!ngoId) {
            return res.status(400).json({
                success: false,
                message: 'NGO ID is required'
            });
        }

        // Validate if ngoId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(ngoId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid NGO ID format'
            });
        }

        const volunteers = await Volunteer.find({ ngoId })
            .sort({ createdAt: -1 });
        
        console.log('Found volunteers:', volunteers.length);
        
        return res.status(200).json({
            success: true,
            volunteers
        });
    } catch (error) {
        console.error('Error fetching NGO volunteers:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Approve a volunteer
const approveVolunteer = async (req, res) => {
    try {
        const { volunteerId, ngoId } = req.body;

        if (!volunteerId || !ngoId) {
            return res.status(400).json({
                success: false,
                message: 'Volunteer ID and NGO ID are required'
            });
        }

        const volunteer = await Volunteer.findOneAndUpdate(
            { _id: volunteerId, ngoId },
            { isApproved: true },
            { new: true }
        );

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Volunteer approved successfully',
            volunteer
        });
    } catch (error) {
        console.error('Error approving volunteer:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Reject a volunteer
const rejectVolunteer = async (req, res) => {
    try {
        const { volunteerId, ngoId } = req.body;

        if (!volunteerId || !ngoId) {
            return res.status(400).json({
                success: false,
                message: 'Volunteer ID and NGO ID are required'
            });
        }

        const volunteer = await Volunteer.findOneAndUpdate(
            { _id: volunteerId, ngoId },
            { isApproved: false },
            { new: true }
        );

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Volunteer rejected successfully',
            volunteer
        });
    } catch (error) {
        console.error('Error rejecting volunteer:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Get a single volunteer by ID
const getVolunteerById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching volunteer with ID:', id);

        const volunteer = await Volunteer.findById(id);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // If volunteer has an NGO, fetch NGO details
        if (volunteer.ngoId) {
            const ngo = await NGO.findById(volunteer.ngoId);
            if (ngo) {
                volunteer.ngo = ngo;
            }
        }

        return res.status(200).json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching volunteer data',
            error: error.message
        });
    }
};

module.exports = {
    getNGOVolunteers,
    approveVolunteer,
    rejectVolunteer,
    getVolunteerById
}; 