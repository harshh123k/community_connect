const NGO = require('../models/ngo');

const getAllNGOs = async (req, res) => {
    try {
        console.log('Fetching all NGOs...');
        const ngos = await NGO.find({}, '-password');
        console.log('Found NGOs:', ngos.length);
        console.log('NGOs data:', JSON.stringify(ngos, null, 2));
        
        // Filter approved NGOs
        const approvedNGOs = ngos.filter(ngo => ngo.isApproved);
        console.log('Approved NGOs:', approvedNGOs.length);
        console.log('Approved NGOs data:', JSON.stringify(approvedNGOs, null, 2));
        
        // Log pending NGOs
        const pendingNGOs = ngos.filter(ngo => !ngo.isApproved);
        console.log('Pending NGOs:', pendingNGOs.length);
        console.log('Pending NGOs data:', JSON.stringify(pendingNGOs, null, 2));
        
        return res.status(200).json({
            success: true,
            ngos: approvedNGOs // Only return approved NGOs
        });
    } catch (error) {
        console.error('Error fetching NGOs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getNGOById = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id, '-password');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO not found'
            });
        }
        return res.status(200).json({
            success: true,
            ngo
        });
    } catch (error) {
        console.error('Error fetching NGO:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getNGOStats = async (req, res) => {
    try {
        const totalNGOs = await NGO.countDocuments();
        const pendingApprovals = await NGO.countDocuments({ isApproved: false });
        const approvedNGOs = await NGO.countDocuments({ isApproved: true });
        const activeNGOs = await NGO.countDocuments({ isActive: true });

        return res.status(200).json({
            success: true,
            stats: {
                totalNGOs,
                pendingApprovals,
                approvedNGOs,
                activeNGOs
            }
        });
    } catch (error) {
        console.error('Error fetching NGO stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const approveNGO = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Approving NGO:', id);

        const ngo = await NGO.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true }
        );

        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO not found'
            });
        }

        console.log('NGO approved successfully:', ngo);
        return res.status(200).json({
            success: true,
            message: 'NGO approved successfully',
            ngo
        });
    } catch (error) {
        console.error('Error approving NGO:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllNGOs,
    getNGOById,
    getNGOStats,
    approveNGO
}; 