# Contributing to Link Vault

Thank you for your interest in contributing to Link Vault! This guide will help you get started.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A GitHub account

### Local Development
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/link_vault.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in the required values
5. Start the dev server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## How to Contribute

### Reporting Bugs
- Check if the bug is already reported in [Issues](../../issues)
- Open a new issue with the **Bug Report** template
- Include steps to reproduce, expected behavior, and screenshots

### Suggesting Features
- Check existing issues first
- Open a new issue with the **Feature Request** template
- Describe the problem your feature solves

### Submitting Changes
1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes with clear, descriptive commits
3. Add tests if applicable
4. Ensure all tests pass: `npm test`
5. Push to your fork and open a Pull Request

## Code Style
- Follow the existing code style (Prettier + ESLint configured)
- Run `npm run lint` before committing
- Use TypeScript for new files

## Pull Request Guidelines
- Link to the related issue
- Keep PRs focused on a single change
- Add screenshots for UI changes
- Ensure CI checks pass

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
