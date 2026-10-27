# Listing Search Service

A full-stack application for searching, filtering, scoring, and ranking property listings from multiple MLS data feeds.

## Tech Stack
- **Backend:** Java 17, Spring Boot 3, JUnit 5, Jackson
- **Frontend:** React 18, TypeScript, Vite

## Features
- **Filtering:** minPrice, maxPrice, minBedrooms, city, keyword (description & address).
- **Relevance Scoring:** Weighted scoring based on budget proximity (70%) and listing recency (30%).
- **Pagination:** Customizable page sizes with page navigation controls.
- **Robust Error Handling:** Validates inputs (e.g. minPrice > maxPrice, page boundaries) and returns explicit error states to the UI.

## Scoring Formula
1. **Budget Proximity Score:**
   $$\\text{ratio} = \\frac{|\\text{price} - \\text{targetBudget}|}{\\text{targetBudget}}$$
   $$S_{budget} = \\max(0.0, 1.0 - (\\text{ratio} \\times 1.5))$$
2. **Recency Score:**
   $$S_{recency} = \\max(0.0, 1.0 - (\\text{daysOld} / 90.0))$$
3. **Combined Score:**
   $$\\text{Relevance} = (0.7 \\times S_{budget}) + (0.3 \\times S_{recency})$$

## How to Run

### Backend
1. `cd backend`
2. `./mvnw spring-boot:run` (or `mvn spring-boot:run`)
3. Server runs on `http://localhost:8080`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. UI available at `http://localhost:5173`
