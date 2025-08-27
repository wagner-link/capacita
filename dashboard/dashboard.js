// Dashboard Controller
// Dashboard Controller
class DashboardController {
    constructor() {
        this.apiUrl = '/api';
        this.currentUser = null;
        this.autoSaveTimeout = null;
        this.isAutoSaving = false;
        this.isEmployer = false;
        this.init();
    }

    async init() {
        try {
            // Verificar autenticação
            const isAuthenticated = await this.checkAuthentication();
            
            if (!isAuthenticated) {
                window.location.href = '/entrar.html';
                return;
            }

            // Configurar interface baseada no tipo de usuário
            this.setupUserInterface();
            
            // Carregar dados do dashboard
            await this.loadDashboardData();
            
            // Configurar event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            this.showError('Erro ao carregar dashboard');
        }
    }

    async checkAuthentication() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isEmployer = this.currentUser.tipoUsuario === 'empregador';
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Erro na verificação de autenticação:', error);
            return false;
        }
    }

    setupUserInterface() {
        // Atualizar mensagem de boas-vindas
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            const greeting = this.isEmployer 
                ? `Bem-vindo, ${this.currentUser.nomeEmpresa || this.currentUser.nome}!`
                : `Olá, ${this.currentUser.nome}! Pronto para aprender?`;
            welcomeMessage.textContent = greeting;
        }

        // Configurar sistema de autenticação no header
        if (window.authSystem) {
            window.authSystem.currentUser = this.currentUser;
            window.authSystem.updateUI(true);
        }
    }

    async loadDashboardData() {
        try {
            // Carregar perfil do usuário
            await this.loadUserProfile();

            if (this.isEmployer) {
                // Carregar dados específicos do empregador
                await this.loadCandidates();
                await this.loadEmployerStats();
            } else {
                // Carregar dados específicos do candidato
                await this.loadRecommendedCourses();
                await this.loadCandidateStats();
            }

        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    }

    async loadUserProfile() {
        const profileContent = document.getElementById('profileContent');
        
        try {
            if (this.isEmployer) {
                // Buscar dados da empresa
                const response = await fetch(`${this.apiUrl}/companies`);
                const companies = await response.json();
                const company = companies.find(c => c.id === this.currentUser.id);
                
                if (company) {
                    profileContent.innerHTML = this.buildEmployerProfile(company);
                } else {
                    profileContent.innerHTML = this.buildEmployerProfile(this.currentUser);
                }
            } else {
                // Buscar dados do estudante
                const response = await fetch(`${this.apiUrl}/students`);
                const students = await response.json();
                const student = students.find(s => s.id === this.currentUser.id);
                
                if (student) {
                    profileContent.innerHTML = this.buildCandidateProfile(student);
                } else {
                    profileContent.innerHTML = this.buildCandidateProfile(this.currentUser);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            profileContent.innerHTML = '<p class="error-message">Erro ao carregar perfil</p>';
        }
    }

    buildEmployerProfile(company) {
        return `
            <div class="profile-info">
                <div class="profile-item">
                    <span class="profile-label">Empresa:</span>
                    <span class="profile-value">${company.nomeEmpresa || company.nome}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">CNPJ:</span>
                    <span class="profile-value">${company.cnpj || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Email:</span>
                    <span class="profile-value">${company.email}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Cidade:</span>
                    <span class="profile-value">${company.cidade || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Setor:</span>
                    <span class="profile-value">${company.setor || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Telefone:</span>
                    <span class="profile-value">${company.telefone || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Sexo:</span>
                    <span class="profile-value">${company.sexo ? (company.sexo === 'masculino' ? 'Masculino' : 'Feminino') : 'Não informado'}</span>
                </div>
            </div>
        `;
    }

    buildCandidateProfile(student) {
        return `
            <div class="profile-info">
                ${student.isAtirador ? '<div class="military-info"><h4>🎖️ Informações Militares</h4><p><strong>Situação:</strong> ' + (student.situacaoMilitar || 'Não informado') + '</p><p><strong>Tiro de Guerra:</strong> ' + (student.tiroGuerra || 'Não informado') + '</p></div>' : ''}
                <div class="profile-item">
                    <span class="profile-label">Nome:</span>
                    <span class="profile-value">${student.nome}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Email:</span>
                    <span class="profile-value">${student.email}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Cidade:</span>
                    <span class="profile-value">${student.cidade || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Telefone:</span>
                    <span class="profile-value">${student.telefone || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Idade:</span>
                    <span class="profile-value">${student.idade || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Escolaridade:</span>
                    <span class="profile-value">${student.escolaridade || 'Não informado'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Sexo:</span>
                    <span class="profile-value">${student.sexo ? (student.sexo === 'masculino' ? 'Masculino' : 'Feminino') : 'Não informado'}</span>
                </div>
            </div>
        `;
    }

    async loadRecommendedCourses() {
        const coursesContent = document.getElementById('coursesContent');
        
        try {
            const response = await fetch(`${this.apiUrl}/courses`);
            const courses = await response.json();
            
            // Pegar os primeiros 4 cursos como recomendados
            const recommendedCourses = courses.slice(0, 4);
            
            if (recommendedCourses.length > 0) {
                coursesContent.innerHTML = `
                    <div class="courses-list">
                        ${recommendedCourses.map(course => `
                            <div class="course-item">
                                <div class="course-icon">📚</div>
                                <div class="course-info">
                                    <div class="course-title">${course.title}</div>
                                    <div class="course-category">${course.category}</div>
                                </div>
                                <button class="course-btn" onclick="window.open('${course.courseUrl}', '_blank')">
                                    Ver Curso
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                coursesContent.innerHTML = '<p>Nenhum curso disponível no momento.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
            coursesContent.innerHTML = '<p class="error-message">Erro ao carregar cursos</p>';
        }
    }

    async loadCandidates() {
        const candidatesContent = document.getElementById('candidatesContent');
        
        try {
            const response = await fetch(`${this.apiUrl}/students`);
            const students = await response.json();
            
            if (students.length > 0) {
                candidatesContent.innerHTML = `
                    <div class="candidates-list">
                        ${students.slice(0, 5).map(student => `
                            <div class="candidate-item ${student.isAtirador ? 'atirador-card' : ''}" onclick="dashboardController.showCandidateDetails('${student.id}')">
                                <div class="candidate-avatar">
                                    ${student.nome.charAt(0).toUpperCase()}
                                </div>
                                <div class="candidate-info">
                                    <div class="candidate-name">
                                        ${student.nome}
                                        ${student.isAtirador ? '<span class="atirador-badge">Atirador</span>' : ''}
                                    </div>
                                    <div class="candidate-skills">${student.habilidades || 'Habilidades não informadas'}</div>
                                    <div class="candidate-city">${student.cidade}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                candidatesContent.innerHTML = '<p>Nenhum candidato disponível no momento.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar candidatos:', error);
            candidatesContent.innerHTML = '<p class="error-message">Erro ao carregar candidatos</p>';
        }
    }

    async loadCandidateStats() {
        // Estatísticas simuladas para candidatos
        document.getElementById('coursesCompleted').textContent = '3';
        document.getElementById('certificatesEarned').textContent = '2';
        document.getElementById('profileViews').textContent = '15';
    }

    async loadEmployerStats() {
        try {
            const response = await fetch(`${this.apiUrl}/students`);
            const students = await response.json();
            
            document.getElementById('totalCandidates').textContent = students.length;
            document.getElementById('profileViews').textContent = '42';
            document.getElementById('contactsReceived').textContent = '8';
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Botão de editar perfil
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditProfileModal());
        }

        // Botões do modal de edição
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const editProfileForm = document.getElementById('editProfileForm');

        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.hideModal('editProfileModal'));
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.hideModal('editProfileModal'));
        }

        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Botões específicos do empregador
        if (this.isEmployer) {
            const searchCandidatesBtn = document.getElementById('searchCandidatesBtn');
            const viewApplicationsBtn = document.getElementById('viewApplicationsBtn');
            const contactSupportBtn = document.getElementById('contactSupportBtn');

            if (searchCandidatesBtn) {
                searchCandidatesBtn.addEventListener('click', () => this.searchCandidates());
            }

            if (viewApplicationsBtn) {
                viewApplicationsBtn.addEventListener('click', () => this.viewApplications());
            }

            if (contactSupportBtn) {
                contactSupportBtn.addEventListener('click', () => this.contactSupport());
            }
        }

        // Event listeners dos modais
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Fechar modais clicando no overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal(overlay.id);
                }
            });
        });

        // Botões dos modais de candidato
    // Auto-save functionality
    setupAutoSave() {
        if (!this.isEmployer) {
            // Setup auto-save for candidate profile fields
            const autoSaveFields = [
                'editNome', 'editEmail', 'editTelefone', 'editCidade', 
                'editHabilidades', 'editExperiencia', 'editFormacao', 'editSexo'
            ];

            autoSaveFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => this.handleAutoSave());
                    field.addEventListener('change', () => this.handleAutoSave());
                }
            });
        }
    }

    handleAutoSave() {
        if (this.isAutoSaving) return;

        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout for auto-save (2 seconds after last change)
        this.autoSaveTimeout = setTimeout(() => {
            this.performAutoSave();
        }, 2000);
    }

    async performAutoSave() {
        if (this.isAutoSaving) return;

        this.isAutoSaving = true;
        this.showAutoSaveIndicator('saving');

        try {
            const updateData = this.collectProfileData();
            
            const response = await fetch(`${this.apiUrl}/users/${this.currentUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar automaticamente');
            }

            this.showAutoSaveIndicator('saved');
            
            // Hide indicator after 2 seconds
            setTimeout(() => {
                this.hideAutoSaveIndicator();
            }, 2000);

        } catch (error) {
            console.error('Erro no auto-save:', error);
            this.showAutoSaveIndicator('error');
            
            setTimeout(() => {
                this.hideAutoSaveIndicator();
            }, 3000);
        } finally {
            this.isAutoSaving = false;
        }
    }

    collectProfileData() {
        return {
            nome: document.getElementById('editNome')?.value || '',
            email: document.getElementById('editEmail')?.value || '',
            telefone: document.getElementById('editTelefone')?.value || '',
            cidade: document.getElementById('editCidade')?.value || '',
            sexo: document.getElementById('editSexo')?.value || '',
            habilidades: document.getElementById('editHabilidades')?.value || '',
            experiencia: document.getElementById('editExperiencia')?.value || '',
            formacao: document.getElementById('editFormacao')?.value || ''
        };
    }

    showAutoSaveIndicator(status) {
        const indicator = document.getElementById('autoSaveIndicator');
        const statusElement = document.getElementById('saveStatus');
        
        if (!indicator || !statusElement) return;

        // Remove all status classes
        indicator.classList.remove('saving', 'saved', 'error');
        
        // Add current status class
        indicator.classList.add(status);
        
        // Update text
        const statusTexts = {
            saving: 'Salvando...',
            saved: 'Salvo automaticamente',
            error: 'Erro ao salvar'
        };
        
        statusElement.textContent = statusTexts[status] || 'Salvando...';
        
        // Show indicator
        indicator.style.display = 'block';
    }

    hideAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

        const closeCandidateModal = document.getElementById('closeCandidateModal');
        const closeCandidateDetailsBtn = document.getElementById('closeCandidateDetailsBtn');
        const contactCandidateBtn = document.getElementById('contactCandidateBtn');

        if (closeCandidateModal) {
            closeCandidateModal.addEventListener('click', () => this.hideModal('candidateModal'));
        }

        if (closeCandidateDetailsBtn) {
            closeCandidateDetailsBtn.addEventListener('click', () => this.hideModal('candidateModal'));
        }

        if (contactCandidateBtn) {
            contactCandidateBtn.addEventListener('click', () => this.contactCandidate());
        }
    }

    async openEditProfileModal() {
        try {
            if (this.isEmployer) {
                // Carregar dados da empresa
                const response = await fetch(`${this.apiUrl}/companies`);
                const companies = await response.json();
                const company = companies.find(c => c.id === this.currentUser.id) || this.currentUser;

                document.getElementById('editNomeEmpresa').value = company.nomeEmpresa || company.nome || '';
                document.getElementById('editCnpj').value = company.cnpj || '';
                document.getElementById('editEmail').value = company.email || '';
                document.getElementById('editTelefone').value = company.telefone || '';
                document.getElementById('editCidade').value = company.cidade || '';
                document.getElementById('editSetor').value = company.setor || '';
                document.getElementById('editInformacoes').value = company.informacoes || '';
            } else {
                // Carregar dados do estudante
                const response = await fetch(`${this.apiUrl}/students`);
                const students = await response.json();
                const student = students.find(s => s.id === this.currentUser.id) || this.currentUser;

                document.getElementById('editNome').value = student.nome || '';
                document.getElementById('editEmail').value = student.email || '';
                document.getElementById('editTelefone').value = student.telefone || '';
                document.getElementById('editCidade').value = student.cidade || '';
                document.getElementById('editSexo').value = student.sexo || '';
                document.getElementById('editHabilidades').value = student.habilidades || '';
                document.getElementById('editExperiencia').value = student.experiencia || '';
                document.getElementById('editFormacao').value = student.formacao || '';
                
                // Show military fields if applicable
                if (student.sexo === 'masculino' && (student.situacaoMilitar || student.tiroGuerra)) {
                    document.getElementById('militaryFieldsRow').style.display = 'flex';
                    document.getElementById('editSituacaoMilitar').value = student.situacaoMilitar || '';
                    document.getElementById('editTiroGuerra').value = student.tiroGuerra || '';
                } else {
                    document.getElementById('militaryFieldsRow').style.display = 'none';
                }
            }

            this.showModal('editProfileModal');
        } catch (error) {
            console.error('Erro ao abrir modal de edição:', error);
            this.showError('Erro ao carregar dados para edição');
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        const saveButton = document.getElementById('saveProfileBtn');
        
        try {
            this.showButtonLoading('saveProfileBtn', true);

            // Coletar dados do formulário
            const form = e.target;
            const formData = new FormData(form);
            const updateData = {};
            for (let [key, value] of formData.entries()) {
                const newKey = key.replace('edit', '');
                updateData[newKey.charAt(0).toLowerCase() + newKey.slice(1)] = value;
            }

            // Enviar dados para a API
            const response = await fetch(`${this.apiUrl}/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });
            
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Erro ao atualizar perfil.');
            }

            this.hideModal('editProfileModal');
            this.showSuccessModal('Perfil Atualizado', 'Suas informações foram salvas com sucesso!');
            
            // Recarregar dados do perfil para refletir as mudanças
            await this.loadUserProfile();

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            this.showErrorModal('Erro', error.message || 'Não foi possível atualizar o perfil.');
        } finally {
            this.showButtonLoading('saveProfileBtn', false);
        }
    }

    async showCandidateDetails(candidateId) {
        try {
            const response = await fetch(`${this.apiUrl}/students`);
            const students = await response.json();
            const candidate = students.find(s => s.id === candidateId);

            if (candidate) {
                const candidateDetails = document.getElementById('candidateDetails');
                candidateDetails.innerHTML = `
                    <div class="candidate-details">
                        <div class="detail-section">
                            <div class="detail-title">Informações Pessoais</div>
                            <div class="detail-content">
                                <p><strong>Nome:</strong> ${candidate.nome}</p>
                                <p><strong>Email:</strong> ${candidate.email}</p>
                                <p><strong>Telefone:</strong> ${candidate.telefone || 'Não informado'}</p>
                                <p><strong>Cidade:</strong> ${candidate.cidade}</p>
                                <p><strong>Idade:</strong> ${candidate.idade || 'Não informado'}</p>
                                <p><strong>Escolaridade:</strong> ${candidate.escolaridade || 'Não informado'}</p>
                                <p><strong>Sexo:</strong> ${candidate.sexo ? (candidate.sexo === 'masculino' ? 'Masculino' : 'Feminino') : 'Não informado'}</p>
                                ${candidate.isAtirador ? `<p><strong>Situação Militar:</strong> ${candidate.situacaoMilitar || 'Não informado'}</p>` : ''}
                                ${candidate.isAtirador ? `<p><strong>Tiro de Guerra:</strong> ${candidate.tiroGuerra || 'Não informado'}</p>` : ''}
                            </div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-title">Habilidades</div>
                            <div class="detail-content">${candidate.habilidades || 'Não informado'}</div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-title">Experiência Profissional</div>
                            <div class="detail-content">${candidate.experiencia || 'Não informado'}</div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-title">Formação</div>
                            <div class="detail-content">${candidate.formacao || 'Não informado'}</div>
                        </div>
                    </div>
                `;

                this.currentCandidateEmail = candidate.email;
                this.showModal('candidateModal');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do candidato:', error);
            this.showError('Erro ao carregar detalhes do candidato');
        }
    }

    contactCandidate() {
        if (this.currentCandidateEmail) {
            const subject = encodeURIComponent('Oportunidade de Emprego - Capacita Arapiraca');
            const body = encodeURIComponent(`Olá,\n\nVi seu perfil no Capacita Arapiraca e gostaria de conversar sobre uma oportunidade em nossa empresa.\n\nAtenciosamente,\n${this.currentUser.nomeEmpresa || this.currentUser.nome}`);
            
            window.open(`mailto:${this.currentCandidateEmail}?subject=${subject}&body=${body}`);
        }
    }

    searchCandidates() {
        this.showInfo('Funcionalidade de busca avançada em desenvolvimento');
    }

    viewApplications() {
        this.showInfo('Funcionalidade de candidaturas em desenvolvimento');
    }

    contactSupport() {
        const supportEmail = 'capacitaarapiraca0@gmail.com';
        const subject = encodeURIComponent('Suporte - Dashboard Empregador');
        const body = encodeURIComponent(`Olá,\n\nPreciso de ajuda com o dashboard do empregador.\n\nEmpresa: ${this.currentUser.nomeEmpresa || this.currentUser.nome}\nEmail: ${this.currentUser.email}\n\nDescrição do problema:\n\n`);
        
        window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
    }

    // Métodos utilitários
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showButtonLoading(buttonId, show) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (show) {
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
            button.disabled = true;
        } else {
            if (btnText) btnText.style.display = 'block';
            if (btnLoading) btnLoading.style.display = 'none';
            button.disabled = false;
        }
    }

    showSuccessModal(title, message) {
        const titleElement = document.getElementById('successTitle');
        const messageElement = document.getElementById('successMessage');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        
        this.showModal('successModal');
    }

    showError(message) {
        alert(`Erro: ${message}`);
    }

    showInfo(message) {
        alert(`Info: ${message}`);
    }
}

// Inicializar dashboard quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardController = new DashboardController();
});