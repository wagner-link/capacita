const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3300;

// Middleware
app.use(cors());
app.use(express.json());

// Arquivos locais para armazenamento
const COURSES_FILE = path.join(__dirname, 'courses.json');
const STUDENTS_FILE = path.join(__dirname, 'students.json');
const COMPANIES_FILE = path.join(__dirname, 'companies.json');

// Função para ler os cursos do arquivo JSON local
async function readCourses() {
  try {
    if (!fs.existsSync(COURSES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(COURSES_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.courses || [];
  } catch (error) {
    console.error('Error reading courses from JSON file:', error);
    return [];
  }
}

// Função para escrever os cursos no arquivo JSON local
async function writeCourses(coursesData) {
  try {
    const dataToWrite = JSON.stringify({ courses: coursesData }, null, 2);
    fs.writeFileSync(COURSES_FILE, dataToWrite, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing courses to JSON file:', error);
    return false;
  }
}

// Função para ler os alunos/atiradores do arquivo JSON local
async function readStudents() {
  try {
    if (!fs.existsSync(STUDENTS_FILE)) {
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify({ students: [] }, null, 2));
      return [];
    }
    const data = fs.readFileSync(STUDENTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.students || [];
  } catch (error) {
    console.error('Error reading students from JSON file:', error);
    return [];
  }
}

// Função para escrever os alunos/atiradores no arquivo JSON local
async function writeStudents(studentsData) {
  try {
    const dataToWrite = JSON.stringify({ students: studentsData }, null, 2);
    fs.writeFileSync(STUDENTS_FILE, dataToWrite, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing students to JSON file:', error);
    return false;
  }
}

// Função para ler as empresas do arquivo JSON local
async function readCompanies() {
  try {
    if (!fs.existsSync(COMPANIES_FILE)) {
      fs.writeFileSync(COMPANIES_FILE, JSON.stringify({ companies: [] }, null, 2));
      return [];
    }
    const data = fs.readFileSync(COMPANIES_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData.companies || [];
  } catch (error) {
    console.error('Error reading companies from JSON file:', error);
    return [];
  }
}

// Função para escrever as empresas no arquivo JSON local
async function writeCompanies(companiesData) {
  try {
    const dataToWrite = JSON.stringify({ companies: companiesData }, null, 2);
    fs.writeFileSync(COMPANIES_FILE, dataToWrite, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing companies to JSON file:', error);
    return false;
  }
}

// Função para gerar um ID único
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// GET /api/courses - Pega todos os cursos
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await readCourses();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:page - Pega cursos por página
app.get('/api/courses/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const allCourses = await readCourses();
    const filteredCourses = allCourses.filter(course => course.page === page);
    res.json(filteredCourses);
  } catch (error) {
    console.error('Error fetching courses by page:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/courses - Adiciona um novo curso
app.post('/api/courses', async (req, res) => {
  try {
    const { title, category, description, imageUrl, courseUrl, page, downloadUrl } = req.body;

    if (!title || !category || !description || !imageUrl || !courseUrl || !page) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const allCourses = await readCourses();
    const newCourse = {
      id: generateId(),
      title,
      category,
      description,
      imageUrl,
      courseUrl,
      page,
      downloadUrl,
    };

    allCourses.push(newCourse);
    
    const success = await writeCourses(allCourses);
    if (!success) {
      return res.status(500).json({ error: 'Failed to save course' });
    }

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PUT /api/courses/:id - Atualiza um curso
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, imageUrl, courseUrl, page, downloadUrl } = req.body;

    if (!title || !category || !description || !imageUrl || !courseUrl || !page) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const allCourses = await readCourses();
    const courseIndex = allCourses.findIndex(course => course.id === id);

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = { id, title, category, description, imageUrl, courseUrl, page, downloadUrl };
    allCourses[courseIndex] = updatedCourse;
    
    const success = await writeCourses(allCourses);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update course' });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/courses/:id - Deleta um curso
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allCourses = await readCourses();
    const courseIndex = allCourses.findIndex(course => course.id === id);

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const deletedCourse = allCourses.splice(courseIndex, 1)[0];
    
    const success = await writeCourses(allCourses);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete course' });
    }

    res.json({ message: 'Course deleted successfully', course: deletedCourse });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// GET /api/students - Pega todos os alunos/atiradores
app.get('/api/students', async (req, res) => {
  try {
    const students = await readStudents();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students - Adiciona um novo aluno/atirador
app.post('/api/students', async (req, res) => {
  try {
    const { nome, cidade, email, telefone, habilidades, experiencia, formacao } = req.body;

    if (!nome || !cidade || !email || !telefone || !habilidades) {
      return res.status(400).json({ error: 'Nome, cidade, email, telefone e habilidades são obrigatórios' });
    }

    const allStudents = await readStudents();
    
    // Verificar se email já existe
    const existingStudent = allStudents.find(student => student.email === email);
    if (existingStudent) {
      return res.status(409).json({ error: 'Já existe um aluno cadastrado com este email' });
    }

    const newStudent = {
      id: generateId(),
      nome,
      cidade,
      email,
      telefone,
      habilidades,
      experiencia: experiencia || '',
      formacao: formacao || '',
      tipo: 'atirador',
      dataRegistro: new Date().toISOString()
    };

    allStudents.push(newStudent);
    
    const success = await writeStudents(allStudents);
    if (!success) {
      return res.status(500).json({ error: 'Failed to save student' });
    }

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// GET /api/companies - Pega todas as empresas
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await readCompanies();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// POST /api/companies - Adiciona uma nova empresa
app.post('/api/companies', async (req, res) => {
  try {
    const { nomeEmpresa, cidade, email, informacoes } = req.body;

    if (!nomeEmpresa || !cidade || !email) {
      return res.status(400).json({ error: 'Nome da empresa, cidade e email são obrigatórios' });
    }

    const allCompanies = await readCompanies();
    
    // Verificar se email já existe
    const existingCompany = allCompanies.find(company => company.email === email);
    if (existingCompany) {
      return res.status(409).json({ error: 'Já existe uma empresa cadastrada com este email' });
    }

    const newCompany = {
      id: generateId(),
      nomeEmpresa,
      cidade,
      email,
      informacoes: informacoes || '',
      tipo: 'empresa',
      dataRegistro: new Date().toISOString()
    };

    allCompanies.push(newCompany);
    
    const success = await writeCompanies(allCompanies);
    if (!success) {
      return res.status(500).json({ error: 'Failed to save company' });
    }

    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor da API rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET/POST /api/courses`);
  console.log(`   - GET/POST /api/students`);
  console.log(`   - GET/POST /api/companies`);
});

module.exports = app;