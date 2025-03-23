const express = require("express");
const multer = require('multer');
const router = express.Router();
const controllerStudent = require("../controllers/students");
const controllerMentor = require("../controllers/mentors");
const controllerCoordinator = require("../controllers/coordinators");
const controllerAdmin = require("../controllers/admin");
const controllerNGO = require("../controllers/ngo");
const controllerProject = require("../controllers/project");
const { login, register, approveUser, logout } = require("../controllers/auth");
const { body } = require('express-validator');
const volunteerController = require('../controllers/volunteer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// Validation middleware
const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
    body('address').notEmpty().withMessage('Address is required'),
    body('userType').isIn(['volunteer', 'ngo', 'government']).withMessage('Invalid user type'),
    // Additional validation based on user type
    body('interests').if(body('userType').equals('volunteer')).isArray().withMessage('Please select at least one interest'),
    body('skills').if(body('userType').equals('volunteer')).isArray().withMessage('Please select at least one skill'),
    body('organization').if(body('userType').equals('ngo')).notEmpty().withMessage('Organization name is required'),
    body('registrationNumber').if(body('userType').equals('ngo')).notEmpty().withMessage('NGO registration number is required'),
    body('website').if(body('userType').equals('ngo')).isURL().withMessage('Please enter a valid website URL'),
    body('department').if(body('userType').equals('government')).notEmpty().withMessage('Department is required'),
    body('designation').if(body('userType').equals('government')).notEmpty().withMessage('Designation is required'),
    body('experience').if(body('userType').equals('government')).isInt({ min: 0 }).withMessage('Experience must be a positive number')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Get Routes
router.get("/students/all", controllerStudent.getAllStudents);
router.get("/mentors/all", controllerMentor.getAllMentors);
router.get("/announcements/all", controllerAdmin.getAllAnnouncements);
router.get("/coordinators/all", controllerCoordinator.getAllCoordinators);
router.get("/download-template", controllerCoordinator.downloadCSVTemplate);
router.get("/donload-student-template", controllerCoordinator.downloadStudentTemplate);
router.get("/ngo/all", controllerNGO.getAllNGOs);
router.get("/ngo/:id", controllerNGO.getNGOById);
router.get("/ngo/stats", controllerNGO.getNGOStats);
router.get("/projects/ngo/:ngoId", controllerProject.getNGOProjects);
router.get("/projects/:id", controllerProject.getProjectById);

// Post Routes
router.post("/student-login", controllerStudent.loginStudent);
router.post("/student/register", controllerStudent.registerStudent);
router.post("/student/progress/add", controllerStudent.addWeeklyProgress);
router.post("/student/find", controllerStudent.getOneStudent);
router.post("/student/approve", controllerStudent.approveStudent);
router.post("/student/evaluation/add", controllerStudent.addWorkDone);
router.post("/student/certificate/upload", upload.single('file'), controllerStudent.uploadCertificate);
router.post("/student/report/upload", upload.single('file'), controllerStudent.uploadReport);
router.post("/student/other/upload", upload.single('file'), controllerStudent.uploadOther);
router.post("/mentor/comment/add", controllerMentor.addPrivateComments);
router.post("/mentor/student/evaluation", controllerMentor.studentEvaluation);
router.post("/mentor/student/evaluation/setdate", controllerMentor.scheduleEvaluation);
router.post("/remove/mentor", controllerMentor.removeMentor);
router.post("/mentor/student/evaluation/upload", upload.single('file'), controllerMentor.uploadSignedDocument);
router.post('/coordinator/add/mentor', controllerCoordinator.addMentor);
router.post('/coordinator/add/mentors', controllerCoordinator.addMentors);
router.post("/coordinator/mentor/assign-student", controllerCoordinator.assignStudent);
router.post("/coordinator/mentor/remove-assigned-student", controllerCoordinator.removeAssignedStudent);
router.post("/coordinator/statistics", controllerCoordinator.getStatisticsCoordinator);
router.post("/admin/statistics", controllerAdmin.getStatisticsAdmin);
router.post("/admin/add/coordinator", controllerAdmin.addCoordinator);
router.post("/admin/delete/coordinator", controllerAdmin.deleteCoordinator);
router.post("/announcement/add", controllerAdmin.postAnnouncement);
router.post("/projects", controllerProject.createProject);
router.put("/projects/:id", controllerProject.updateProject);
router.delete("/projects/:id", controllerProject.deleteProject);

// Auth Routes
router.post("/login", loginValidation, login);
router.post("/register", registerValidation, register);
router.post("/approve-user", [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('userType').isIn(['volunteer', 'ngo', 'government']).withMessage('Invalid user type')
], approveUser);
router.post("/logout", logout);

// File Upload Routes
router.post("/upload/profile", upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // Handle file upload logic here
        res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Volunteer routes
router.get('/volunteers/ngo/:ngoId', volunteerController.getNGOVolunteers);
router.get('/volunteers/:id', volunteerController.getVolunteerById);
router.post('/volunteers/approve', volunteerController.approveVolunteer);
router.post('/volunteers/reject', volunteerController.rejectVolunteer);

// NGO routes
router.get("/ngo/all", controllerNGO.getAllNGOs);
router.get("/ngo/:id", controllerNGO.getNGOById);
router.get("/ngo/stats", controllerNGO.getNGOStats);
router.post("/ngo/approve/:id", controllerNGO.approveNGO);

module.exports = router;