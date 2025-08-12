class AdminDashboard {
    constructor() {
        this.apiUrl = '/api';
        this.courses = [];
        this.filteredCourses = [];
        this.currentCourse = null;
        this.isEditing = false;
        this.students = [];
        this.filteredStudents = [];
        this.companies = [];
        this.filteredCompanies = [];
        this.currentSection = 'courses';
        
        this.init();
    }

    init() {
        // Verifica se o usuário está logado
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        this.setupEventListeners();
        this.loadCourses();
        this.loadStudents();
        this.loadCompanies();
    }

    setupEventListeners() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', this.logout.bind(this));

        // Botão de adicionar curso
        document.getElementById('addCourseBtn').addEventListener('click', () => {
            this.openCourseModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', this.closeCourseModal.bind(this));
        document.getElementById('cancelBtn').addEventListener('click', this.closeCourseModal.bind(this));

        // Form submission
        document.getElementById('courseForm').addEventListener('submit', this.handleFormSubmit.bind(this));

        // Delete modal
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.hideModal('deleteModal');
        });
        document.getElementById('confirmDeleteBtn').addEventListener('click', this.confirmDelete.bind(this));

        // Filters
        document.getElementById('pageFilter').addEventListener('change', this.applyFilters.bind(this));
        document.getElementById('searchInput').addEventListener('input', this.applyFilters.bind(this));

        // Image preview
        document.getElementById('courseImageUrl').addEventListener('input', this.updateImagePreview.bind(this));

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Student filters
        document.getElementById('studentCityFilter')?.addEventListener('change', this.applyStudentFilters.bind(this));
        document.getElementById('studentSearchInput')?.addEventListener('input', this.applyStudentFilters.bind(this));

        // Company filters
        document.getElementById('companyCityFilter')?.addEventListener('change', this.applyCompanyFilters.bind(this));
        document.getElementById('companySearchInput')?.addEventListener('input', this.applyCompanyFilters.bind(this));

        // Modal close buttons for new modals
        document.getElementById('closeStudentModal')?.addEventListener('click', () => this.hideModal('studentModal'));
        document.getElementById('closeStudentDetailsBtn')?.addEventListener('click', () => this.hideModal('studentModal'));
        document.getElementById('closeCompanyModal')?.addEventListener('click', () => this.hideModal('companyModal'));
        document.getElementById('closeCompanyDetailsBtn')?.addEventListener('click', () => this.hideModal('companyModal'));

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
    }

    isLoggedIn() {
        const loggedIn = localStorage.getItem('adminLoggedIn');
        const loginTime = localStorage.getItem('adminLoginTime');
        
        if (!loggedIn || !loginTime) return false;
        
        // Checa se o login foi feito há mais de 24 horas
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - loginTimestamp > twentyFourHours) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            return false;
        }
        
        return true;
    }

    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
    }

    async loadCourses() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiUrl}/courses`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.courses = await response.json();
            this.filteredCourses = [...this.courses];
            this.renderCourses();
            this.updateStats();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showToast('Erro ao carregar cursos. Verifique se a API está funcionando.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const table = document.getElementById('coursesTable');
        
        if (show) {
            loadingState.style.display = 'block';
            table.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            table.style.display = 'table';
        }
    }

    renderCourses() {
        const tbody = document.getElementById('coursesTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredCourses.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('coursesTable').style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        document.getElementById('coursesTable').style.display = 'table';

        tbody.innerHTML = this.filteredCourses.map(course => `
            <tr>
                <td>
                    <div style="max-width: 300px;">
                        <strong>${this.escapeHtml(course.title)}</strong>
                    </div>
                </td>
                <td>${this.escapeHtml(course.category)}</td>
                <td>
                    <span class="page-badge ${this.getPageClass(course.page)}">
                        ${this.getPageDisplayName(course.page)}
                    </span>
                </td>
                <td>
                    <span class="status-badge">Ativo</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-icon-only" onclick="adminDashboard.editCourse('${course.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-danger btn-icon-only" onclick="adminDashboard.deleteCourse('${course.id}')" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const total = this.courses.length;
        const empreend = this.courses.filter(c => c.page === 'empreend.html').length;
        const job = this.courses.filter(c => c.page === 'primeiroemprego.html').length;
        const finance = this.courses.filter(c => c.page === 'financ.html').length;
        const newjob = this.courses.filter(c => c.page === 'novoemp.html').length;
        const habitos = this.courses.filter(c => c.page === 'habitos.html').length;

        document.getElementById('totalCourses').textContent = total;
        document.getElementById('empreendCourses').textContent = empreend;
        document.getElementById('jobCourses').textContent = job;
        document.getElementById('financeCourses').textContent = finance;
        document.getElementById('NewjobCourses').textContent = newjob;
        document.getElementById('habitosCourses').textContent = habitos;
        
    }

    applyFilters() {
        const pageFilter = document.getElementById('pageFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredCourses = this.courses.filter(course => {
            const matchesPage = !pageFilter || course.page === pageFilter;
            const matchesSearch = !searchTerm || 
                course.title.toLowerCase().includes(searchTerm) ||
                course.category.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm);

            return matchesPage && matchesSearch;
        });

        this.renderCourses();
    }

    openCourseModal(course = null) {
        this.currentCourse = course;
        this.isEditing = !!course;

        const modal = document.getElementById('courseModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('courseForm');

        modalTitle.textContent = this.isEditing ? 'Editar Curso' : 'Adicionar Novo Curso';

        if (this.isEditing) {

            document.getElementById('courseTitle').value = course.title;
            document.getElementById('courseCategory').value = course.category;
            document.getElementById('courseDescription').value = course.description;
            document.getElementById('courseImageUrl').value = course.imageUrl;
            document.getElementById('courseUrl').value = course.courseUrl;
            document.getElementById('downloadUrl').value = course.downloadUrl || ''; // Preenche com o valor ou string vazia
            document.getElementById('coursePage').value = course.page;
            this.updateImagePreview();
        } else {
            form.reset();
            document.getElementById('imagePreview').style.display = 'none';
        }

        this.showModal('courseModal');
    }

    closeCourseModal() {
        this.hideModal('courseModal');
        this.currentCourse = null;
        this.isEditing = false;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const courseData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            imageUrl: formData.get('imageUrl'),
            courseUrl: formData.get('courseUrl'),
            page: formData.get('page'),
            downloadUrl: formData.get('downloadUrl') || null // Salva null se o campo estiver vazio
        };

        // Validação dos dados do curso
        if (!this.validateCourseData(courseData)) {
            return;
        }

        try {
            this.showButtonLoading('saveBtn', true);

            let response;
            if (this.isEditing) {
                response = await fetch(`${this.apiUrl}/courses/${this.currentCourse.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData)
                });
            } else {
                response = await fetch(`${this.apiUrl}/courses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedCourse = await response.json();
            
            if (this.isEditing) {
                const index = this.courses.findIndex(c => c.id === this.currentCourse.id);
                this.courses[index] = savedCourse;
                this.showToast('Curso atualizado com sucesso!');
            } else {
                this.courses.push(savedCourse);
                this.showToast('Curso adicionado com sucesso!');
            }

            this.filteredCourses = [...this.courses];
            this.renderCourses();
            this.updateStats();
            this.closeCourseModal();

        } catch (error) {
            console.error('Error saving course:', error);
            this.showToast('Erro ao salvar curso. Tente novamente.', 'error');
        } finally {
            this.showButtonLoading('saveBtn', false);
        }
    }

    validateCourseData(data) {
        const requiredFields = ['title', 'category', 'description', 'imageUrl', 'courseUrl', 'page'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showToast(`O campo ${this.getFieldDisplayName(field)} é obrigatório.`, 'error');
                return false;
            }
        }

        // Validar URLs
        try {
            new URL(data.imageUrl);
            new URL(data.courseUrl);
        } catch (error) {
            this.showToast('Por favor, insira URLs válidas.', 'error');
            return false;
        }

        return true;
    }

    editCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            this.openCourseModal(course);
        }
    }

    deleteCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            this.currentCourse = course;
            document.getElementById('deleteCourseTitle').textContent = course.title;
            this.showModal('deleteModal');
        }
    }

    async confirmDelete() {
        if (!this.currentCourse) return;

        try {
            this.showButtonLoading('confirmDeleteBtn', true);

            const response = await fetch(`${this.apiUrl}/courses/${this.currentCourse.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.courses = this.courses.filter(c => c.id !== this.currentCourse.id);
            this.filteredCourses = [...this.courses];
            this.renderCourses();
            this.updateStats();
            this.hideModal('deleteModal');
            this.showToast('Curso excluído com sucesso!');

        } catch (error) {
            console.error('Error deleting course:', error);
            this.showToast('Erro ao excluir curso. Tente novamente.', 'error');
        } finally {
            this.showButtonLoading('confirmDeleteBtn', false);
        }
    }

    updateImagePreview() {
        const imageUrl = document.getElementById('courseImageUrl').value;
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');

        if (imageUrl && this.isValidUrl(imageUrl)) {
            previewImg.src = imageUrl;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    showButtonLoading(buttonId, show) {
        const button = document.getElementById(buttonId);
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (show) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            button.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            button.disabled = false;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        if (type === 'error') {
            toast.style.background = '#dc3545';
        } else {
            toast.style.background = '#28a745';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getPageClass(page) {
        const pageMap = {
            'empreend.html': 'empreend',
            'primeiroemprego.html': 'primeiro',
            'novoemp.html': 'novo',
            'financ.html': 'financ',
            'habitos.html': 'habitos'
        };
        return pageMap[page] || 'default';
    }

    getPageDisplayName(page) {
        const pageMap = {
            'empreend.html': 'Empreendedorismo',
            'primeiroemprego.html': 'Primeiro Emprego',
            'novoemp.html': 'Novo Emprego',
            'financ.html': 'Ed. Financeira',
            'habitos.html': 'Hábitos Saudáveis'
        };
        return pageMap[page] || page;
    }

    getFieldDisplayName(field) {
        const fieldMap = {
            'title': 'Título',
            'category': 'Categoria',
            'description': 'Descrição',
            'imageUrl': 'URL da Imagem',
            'courseUrl': 'URL do Curso',
            'page': 'Página'
        };
        return fieldMap[field] || field;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Navigation methods
    switchSection(section) {
        this.currentSection = section;
        
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });
        
        // Update content sections
        document.querySelectorAll('.content-section').forEach(content => {
            content.classList.toggle('active', content.id === `${section}Section`);
        });
    }

    // Students methods
    async loadStudents() {
        try {
            this.showStudentsLoading(true);
            const response = await fetch(`${this.apiUrl}/students`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.students = await response.json();
            this.filteredStudents = [...this.students];
            this.renderStudents();
            this.updateStudentsStats();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showToast('Erro ao carregar alunos.', 'error');
        } finally {
            this.showStudentsLoading(false);
        }
    }

    showStudentsLoading(show) {
        const loadingState = document.getElementById('studentsLoadingState');
        const table = document.getElementById('studentsTable');
        
        if (show) {
            loadingState.style.display = 'block';
            table.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            table.style.display = 'table';
        }
    }

    renderStudents() {
        const tbody = document.getElementById('studentsTableBody');
        const emptyState = document.getElementById('studentsEmptyState');
        
        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('studentsTable').style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        document.getElementById('studentsTable').style.display = 'table';

        tbody.innerHTML = this.filteredStudents.map(student => {
            const registrationDate = new Date(student.dataRegistro);
            const isRecent = (Date.now() - registrationDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
            
            return `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-name">${this.escapeHtml(student.nome)}</div>
                        <div class="user-email">${this.escapeHtml(student.email)}</div>
                    </div>
                </td>
                <td>
                    <span class="city-badge">${this.escapeHtml(student.cidade)}</span>
                </td>
                <td>
                    <div class="phone-info">${this.escapeHtml(student.telefone || 'Não informado')}</div>
                </td>
                <td>
                    <div class="date-info">
                        ${registrationDate.toLocaleDateString('pt-BR')}
                        <br>
                        <small>${registrationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${isRecent ? 'recent' : 'active'}">
                        ${isRecent ? 'Novo' : 'Ativo'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-icon-only" onclick="adminDashboard.viewStudent('${student.id}')" title="Ver Detalhes">
                            👁️
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }

    updateStudentsStats() {
        const total = this.students.length;
        const thisMonth = this.students.filter(s => {
            const registrationDate = new Date(s.dataRegistro);
            const now = new Date();
            return registrationDate.getMonth() === now.getMonth() && 
                   registrationDate.getFullYear() === now.getFullYear();
        }).length;

        document.getElementById('totalStudents').textContent = total;
        document.getElementById('studentsThisMonth').textContent = thisMonth;
    }

    applyStudentFilters() {
        const cityFilter = document.getElementById('studentCityFilter').value;
        const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();

        this.filteredStudents = this.students.filter(student => {
            const matchesCity = !cityFilter || student.cidade === cityFilter;
            const matchesSearch = !searchTerm || 
                student.nome.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm);

            return matchesCity && matchesSearch;
        });

        this.renderStudents();
    }

    viewStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            this.showStudentDetails(student);
        }
    }

    showStudentDetails(student) {
        const detailsContainer = document.getElementById('studentDetails');
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Nome Completo</div>
                <div class="detail-value">${this.escapeHtml(student.nome)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cidade</div>
                <div class="detail-value">${this.escapeHtml(student.cidade)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">${this.escapeHtml(student.email)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Telefone</div>
                <div class="detail-value">${this.escapeHtml(student.telefone || 'Não informado')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Habilidades</div>
                <div class="detail-value multiline">${this.escapeHtml(student.habilidades || 'Não informado')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Experiência</div>
                <div class="detail-value multiline">${this.escapeHtml(student.experiencia || 'Não informado')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Formação</div>
                <div class="detail-value multiline">${this.escapeHtml(student.formacao || 'Não informado')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Data de Registro</div>
                <div class="detail-value">${new Date(student.dataRegistro).toLocaleString('pt-BR')}</div>
            </div>
        `;
        this.showModal('studentModal');
    }

    // Companies methods
    async loadCompanies() {
        try {
            this.showCompaniesLoading(true);
            const response = await fetch(`${this.apiUrl}/companies`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.companies = await response.json();
            this.filteredCompanies = [...this.companies];
            this.renderCompanies();
            this.updateCompaniesStats();
        } catch (error) {
            console.error('Error loading companies:', error);
            this.showToast('Erro ao carregar empresas.', 'error');
        } finally {
            this.showCompaniesLoading(false);
        }
    }

    showCompaniesLoading(show) {
        const loadingState = document.getElementById('companiesLoadingState');
        const table = document.getElementById('companiesTable');
        
        if (show) {
            loadingState.style.display = 'block';
            table.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            table.style.display = 'table';
        }
    }

    renderCompanies() {
        const tbody = document.getElementById('companiesTableBody');
        const emptyState = document.getElementById('companiesEmptyState');
        
        if (this.filteredCompanies.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            document.getElementById('companiesTable').style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        document.getElementById('companiesTable').style.display = 'table';

        tbody.innerHTML = this.filteredCompanies.map(company => {
            const registrationDate = new Date(company.dataRegistro);
            const isRecent = (Date.now() - registrationDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
            
            return `
            <tr>
                <td>
                    <div class="company-info">
                        <div class="company-name">${this.escapeHtml(company.nomeEmpresa)}</div>
                        <div class="company-email">${this.escapeHtml(company.email)}</div>
                    </div>
                </td>
                <td>
                    <span class="city-badge">${this.escapeHtml(company.cidade)}</span>
                </td>
                <td>
                    <div class="date-info">
                        ${registrationDate.toLocaleDateString('pt-BR')}
                        <br>
                        <small>${registrationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${isRecent ? 'recent' : 'active'}">
                        ${isRecent ? 'Nova' : 'Ativa'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-icon-only" onclick="adminDashboard.viewCompany('${company.id}')" title="Ver Detalhes">
                            👁️
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }

    updateCompaniesStats() {
        const total = this.companies.length;
        const thisMonth = this.companies.filter(c => {
            const registrationDate = new Date(c.dataRegistro);
            const now = new Date();
            return registrationDate.getMonth() === now.getMonth() && 
                   registrationDate.getFullYear() === now.getFullYear();
        }).length;

        document.getElementById('totalCompanies').textContent = total;
        document.getElementById('companiesThisMonth').textContent = thisMonth;
    }

    applyCompanyFilters() {
        const cityFilter = document.getElementById('companyCityFilter').value;
        const searchTerm = document.getElementById('companySearchInput').value.toLowerCase();

        this.filteredCompanies = this.companies.filter(company => {
            const matchesCity = !cityFilter || company.cidade === cityFilter;
            const matchesSearch = !searchTerm || 
                company.nomeEmpresa.toLowerCase().includes(searchTerm) ||
                company.email.toLowerCase().includes(searchTerm);

            return matchesCity && matchesSearch;
        });

        this.renderCompanies();
    }

    viewCompany(companyId) {
        const company = this.companies.find(c => c.id === companyId);
        if (company) {
            this.showCompanyDetails(company);
        }
    }

    showCompanyDetails(company) {
        const detailsContainer = document.getElementById('companyDetails');
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Nome da Empresa</div>
                <div class="detail-value">${this.escapeHtml(company.nomeEmpresa)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cidade</div>
                <div class="detail-value">${this.escapeHtml(company.cidade)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">${this.escapeHtml(company.email)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Necessidades/Informações</div>
                <div class="detail-value multiline">${this.escapeHtml(company.informacoes || 'Não informado')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Data de Registro</div>
                <div class="detail-value">${new Date(company.dataRegistro).toLocaleString('pt-BR')}</div>
            </div>
        `;
        this.showModal('companyModal');
    }
}

// Inicializa o dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});