package com.example.listings.service;

import com.example.listings.model.Listing;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ListingService {

    private List<Listing> listings = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            InputStream inputStream = new ClassPathResource("sample_listings.json").getInputStream();
            this.listings = mapper.readValue(inputStream, new TypeReference<List<Listing>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load sample_listings.json", e);
        }
    }

    public Map<String, Object> searchListings(
            Double minPrice,
            Double maxPrice,
            Integer minBedrooms,
            String city,
            String keyword,
            Double targetBudget,
            int page,
            int pageSize
    ) {
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new IllegalArgumentException("minPrice cannot be greater than maxPrice");
        }
        if (page < 1) {
            throw new IllegalArgumentException("Page number must be at least 1");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("Page size must be at least 1");
        }

        List<Listing> filtered = listings.stream().filter(l -> {
            if (minPrice != null && l.getPrice() < minPrice) return false;
            if (maxPrice != null && l.getPrice() > maxPrice) return false;
            if (minBedrooms != null && l.getBedrooms() < minBedrooms) return false;
            if (city != null && !city.trim().isEmpty() && !l.getCity().equalsIgnoreCase(city.trim())) return false;
            if (keyword != null && !keyword.trim().isEmpty()) {
                String desc = l.getDescription() != null ? l.getDescription().toLowerCase() : "";
                String addr = l.getAddress() != null ? l.getAddress().toLowerCase() : "";
                String kw = keyword.toLowerCase().trim();
                if (!desc.contains(kw) && !addr.contains(kw)) return false;
            }
            return true;
        }).collect(Collectors.toList());

        LocalDate now = LocalDate.now();
        for (Listing l : filtered) {
            double budgetScore = 1.0;
            if (targetBudget != null && targetBudget > 0) {
                double diff = Math.abs(l.getPrice() - targetBudget);
                double ratio = diff / targetBudget;
                budgetScore = Math.max(0.0, 1.0 - (ratio * 1.5));
            }

            double recencyScore = 1.0;
            if (l.getListedDate() != null) {
                long daysOld = ChronoUnit.DAYS.between(l.getListedDate(), now);
                if (daysOld < 0) daysOld = 0;
                recencyScore = Math.max(0.0, 1.0 - ((double) daysOld / 90.0));
            }

            double finalScore = (0.7 * budgetScore) + (0.3 * recencyScore);
            l.setRelevanceScore(Math.round(finalScore * 100.0) / 100.0);
        }

        filtered.sort((a, b) -> {
            int cmp = Double.compare(b.getRelevanceScore(), a.getRelevanceScore());
            if (cmp != 0) return cmp;
            return Double.compare(a.getPrice(), b.getPrice());
        });

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int startIndex = (page - 1) * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalElements);

        List<Listing> paginatedList = new ArrayList<>();
        if (startIndex < totalElements) {
            paginatedList = filtered.subList(startIndex, endIndex);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedList);
        response.put("currentPage", page);
        response.put("pageSize", pageSize);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages == 0 ? 1 : totalPages);
        return response;
    }
}
