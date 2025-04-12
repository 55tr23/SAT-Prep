# SAT Prep App

A comprehensive SAT preparation application powered by AI, designed to help students improve their SAT scores through personalized practice and real-time analytics.

## Features

- **AI-Generated Questions**: Custom practice questions that adapt to your skill level
- **Progress Tracking**: Monitor your performance across different categories
- **Personalized Analytics**: Get insights into your strengths and weaknesses
- **Study Recommendations**: Receive AI-powered study recommendations based on your performance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sat-prep-app.git
   cd sat-prep-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_SEARCH_API_KEY=your_google_search_api_key
   GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
   ```

4. Start the development server:
   ```
   npm start
   ```

## Environment Variables

The application requires the following environment variables to be set:

- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered features
- `GOOGLE_SEARCH_API_KEY`: Your Google Search API key for content insights
- `GOOGLE_SEARCH_ENGINE_ID`: Your Google Custom Search Engine ID

## Project Structure

- `/src`: Source code
  - `/components`: Reusable UI components
  - `/screens`: Application screens
  - `/services`: API and business logic services
  - `/navigation`: Navigation configuration
  - `/config`: Configuration files
  - `/context`: React context providers

## Technologies Used

- React Native
- Expo
- TypeScript
- OpenAI API
- Google Custom Search API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4 API
- Google for the Custom Search API 