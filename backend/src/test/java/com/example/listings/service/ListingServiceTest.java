package com.example.listings.service;

import com.example.listings.model.Listing;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ListingServiceTest {

    private ListingService listingService;

    @BeforeEach
    void setUp() {
        listingService = new ListingService();
        listingService.init();
    }

    @Test
    void testSuccessfulSearchAndPagination() {
        Map<String, Object> result = listingService.searchListings(null, null, null, null, null, null, 1, 5);
        assertNotNull(result);
        assertEquals(1, result.get("currentPage"));
        assertEquals(5, result.get("pageSize"));
        assertTrue((Integer) result.get("totalElements") > 0);
    }

    @Test
    void testInvalidPriceRangeThrowsException() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            listingService.searchListings(600000.0, 400000.0, null, null, null, null, 1, 5);
        });
        assertEquals("minPrice cannot be greater than maxPrice", exception.getMessage());
    }

    @Test
    void testInvalidPageSizeThrowsException() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            listingService.searchListings(null, null, null, null, null, null, 1, 0);
        });
        assertEquals("Page size must be at least 1", exception.getMessage());
    }

    @Test
    void testNoMatchesFound() {
        Map<String, Object> result = listingService.searchListings(1000000.0, 2000000.0, 5, "NonexistentCity", null, null, 1, 5);
        assertEquals(0, result.get("totalElements"));
    }

    @Test
    void testPaginationBoundaries() {
        Map<String, Object> result = listingService.searchListings(null, null, null, null, null, null, 50, 5);
        assertEquals(50, result.get("currentPage"));
        assertNotNull(result.get("content"));
    }

    @Test
    void testScoringAndRankingWithTargetBudget() {
        Map<String, Object> result = listingService.searchListings(null, null, null, "Springfield", null, 450000.0, 1, 5);
        assertNotNull(result);
        @SuppressWarnings("unchecked")
        List<Listing> content = (List<Listing>) result.get("content");
        assertFalse(content.isEmpty());
        assertTrue(content.get(0).getRelevanceScore() >= content.get(content.size() - 1).getRelevanceScore());
    }
}
