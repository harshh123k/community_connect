const Project = require('../models/project');
const mongoose = require('mongoose');

// Get all projects for a specific NGO
const getNGOProjects = async (req, res) => {
    try {
        const { ngoId } = req.params;
        console.log('Fetching projects for NGO:', ngoId); // Debug log

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

        const projects = await Project.find({ ngoId })
            .sort({ createdAt: -1 });
        
        console.log('Found projects:', projects.length); // Debug log
        
        return res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Error fetching NGO projects:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create a new project
const createProject = async (req, res) => {
    try {
        const {
            title,
            description,
            ngoId,
            startDate,
            endDate,
            requiredSkills,
            location,
            maxVolunteers
        } = req.body;

        // Validate required fields
        if (!title || !description || !ngoId || !startDate || !endDate || !location || !maxVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const project = new Project({
            title,
            description,
            ngoId,
            startDate,
            endDate,
            requiredSkills: requiredSkills || [],
            location,
            maxVolunteers
        });

        await project.save();

        return res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update a project
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key in project) {
                project[key] = req.body[key];
            }
        });

        await project.save();

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete a project
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getNGOProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
}; 