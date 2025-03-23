import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { url } from '../../Global/URL';
import axios from 'axios';
import {
    Box,
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Stack,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    VStack,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    InputGroup,
    InputLeftElement,
    Icon,
    Spinner,
    Text
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaTags } from 'react-icons/fa';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        maxVolunteers: 1,
        requiredSkills: [],
        status: 'active'
    });
    const [newSkill, setNewSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const response = await axios.get(`${url}/projects/${id}`);
            if (response.data.success) {
                const project = response.data.project;
                setFormData({
                    title: project.title,
                    description: project.description,
                    startDate: project.startDate.split('T')[0],
                    endDate: project.endDate.split('T')[0],
                    location: project.location,
                    maxVolunteers: project.maxVolunteers,
                    requiredSkills: project.requiredSkills || [],
                    status: project.status
                });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch project details',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            navigate('/ngo/dashboard');
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (value, name) => {
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value)
        }));
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                requiredSkills: [...prev.requiredSkills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.put(`${url}/projects/${id}`, formData);

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Project updated successfully',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                navigate('/ngo/dashboard');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to update project',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Container maxW="container.md" py={8}>
                <Card>
                    <CardBody>
                        <Stack spacing={4} align="center" justify="center" minH="400px">
                            <Spinner size="xl" />
                            <Text>Loading project details...</Text>
                        </Stack>
                    </CardBody>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxW="container.md" py={8}>
            <Card>
                <CardHeader>
                    <Heading size="lg">Edit Project</Heading>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Project Title</FormLabel>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter project title"
                                    disabled={isLoading}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter project description"
                                    rows={4}
                                    disabled={isLoading}
                                />
                            </FormControl>

                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Start Date</FormLabel>
                                    <Input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>End Date</FormLabel>
                                    <Input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel>Location</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FaMapMarkerAlt} color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Enter project location"
                                        disabled={isLoading}
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Maximum Volunteers</FormLabel>
                                <NumberInput
                                    min={1}
                                    value={formData.maxVolunteers}
                                    onChange={(value) => handleNumberChange(value, 'maxVolunteers')}
                                    disabled={isLoading}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Required Skills</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FaTags} color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add required skills"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                        disabled={isLoading}
                                    />
                                </InputGroup>
                                <HStack spacing={2} mt={2} flexWrap="wrap">
                                    {formData.requiredSkills.map((skill) => (
                                        <Tag key={skill} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                                            <TagLabel>{skill}</TagLabel>
                                            <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                                        </Tag>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                    <option value="active">Active</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </Select>
                            </FormControl>

                            <HStack spacing={4}>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    isLoading={isLoading}
                                    loadingText="Updating Project..."
                                    flex={1}
                                >
                                    Update Project
                                </Button>
                                <Button
                                    onClick={() => navigate('/ngo/dashboard')}
                                    variant="outline"
                                    flex={1}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </CardBody>
            </Card>
        </Container>
    );
};

export default EditProject; 