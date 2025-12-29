# Contributing to Poultry Disease Prediction System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/poultry-disease-prediction-full-stack-.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP_GUIDE.md](SETUP_GUIDE.md)

## Development Workflow

### Before You Start
- Check existing issues and pull requests
- Create an issue to discuss major changes
- Keep changes focused and atomic

### Making Changes

#### Backend (Django)
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python manage.py runserver
```

- Follow Django coding standards
- Add tests for new features
- Update API documentation
- Run migrations: `python manage.py makemigrations && python manage.py migrate`

#### Frontend (React)
```bash
cd frontend
npm run dev
```

- Follow React best practices
- Use functional components and hooks
- Keep components small and reusable
- Maintain consistent styling with Tailwind CSS

### Code Style

#### Python (Backend)
- Follow PEP 8 style guide
- Use meaningful variable names
- Add docstrings to functions/classes
- Keep functions focused (single responsibility)

#### JavaScript/React (Frontend)
- Use ES6+ syntax
- Prefer const/let over var
- Use arrow functions
- Destructure props and state
- Add PropTypes or TypeScript types

### Commit Messages

Use conventional commit format:
```
type(scope): subject

body (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(admin): add user filtering by role
fix(auth): resolve JWT refresh token expiration
docs(readme): update setup instructions
```

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG.md with your changes
4. Submit PR with clear description
5. Link related issues
6. Wait for review and address feedback

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe tests performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

## Areas for Contribution

### High Priority
- [ ] Add unit tests (backend & frontend)
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Optimize model inference speed
- [ ] Add more disease classes

### Medium Priority
- [ ] Add pagination to history
- [ ] Implement search in admin tables
- [ ] Add export functionality (CSV/Excel)
- [ ] Improve mobile responsiveness
- [ ] Add internationalization (i18n)

### Low Priority
- [ ] Dark mode enhancement
- [ ] Add more animations
- [ ] Social authentication (Google, Facebook)
- [ ] Email notifications for analysis results
- [ ] Add analytics dashboard

## Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Python/Node version)

## Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (optional)
- Mockups/wireframes (optional)

## Questions or Need Help?

- Check existing documentation
- Search closed issues
- Create a new issue with "question" label
- Email: haseebkhansherani787@gmail.com

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the problem, not the person
- Help create a welcoming environment

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
