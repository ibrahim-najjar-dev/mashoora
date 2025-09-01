import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator, GenericQueryCtx } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";

// Filter arguments schema that matches the client-side filter system
const filterArgsSchema = v.object({
  // Price filters
  price: v.optional(v.number()),
  price_min: v.optional(v.number()),
  price_max: v.optional(v.number()),

  // Category filter
  category: v.optional(v.string()),

  // Duration filter
  meetingDuration: v.optional(v.number()),

  // Rating filter (minimum rating)
  rating: v.optional(v.number()),

  // Language filters (array of language codes)
  spokenLanguages: v.optional(v.array(v.string())),

  // Location filter
  location: v.optional(v.string()),

  // Experience filters
  experience_min: v.optional(v.number()),
  experience_max: v.optional(v.number()),

  // Date filters (for availability)
  availableDates_start: v.optional(v.string()),
  availableDates_end: v.optional(v.string()),
  availableDates: v.optional(v.string()),

  // Search query
  searchQuery: v.optional(v.string()),
});

export const getFilteredServicesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filters: v.optional(filterArgsSchema),
  },
  handler: async (ctx, { paginationOpts, filters = {} }) => {
    // Start with the base query - we'll filter step by step for optimal performance
    let servicesQuery = ctx.db.query("services");

    // Step 1: Apply search if provided (use search index)
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const searchResults = await ctx.db
        .query("services")
        .withSearchIndex("search_body", (q) =>
          q.search("name", filters.searchQuery!)
        )
        .collect();

      // Get the IDs from search results
      const searchServiceIds = new Set(searchResults.map((s) => s._id));

      // Apply all other filters to the search results
      const filteredServices = await applyFiltersToServices(
        ctx,
        searchResults,
        filters
      );

      // Paginate the filtered results manually
      const startIndex = paginationOpts.cursor
        ? parseInt(paginationOpts.cursor)
        : 0;
      const endIndex = startIndex + paginationOpts.numItems;
      const paginatedResults = filteredServices.slice(startIndex, endIndex);

      // Enhance with consultant info
      const enhancedResults = await Promise.all(
        paginatedResults.map((service) =>
          enhanceServiceWithConsultantInfo(ctx, service)
        )
      );

      return {
        page: enhancedResults,
        isDone: endIndex >= filteredServices.length,
        continueCursor: endIndex.toString(),
      };
    }

    // Step 2: For optimal performance with price filters, we should order consistently
    if (
      filters.price !== undefined ||
      filters.price_min !== undefined ||
      filters.price_max !== undefined
    ) {
      // Note: We need to add a price index to the schema for this to work optimally
      // For now, we'll use the default ordering
    }

    // Step 3: Get paginated results and apply filters
    const results = await servicesQuery.paginate(paginationOpts);

    // Step 4: Apply all filters to the paginated results
    const filteredServices = await applyFiltersToServices(
      ctx,
      results.page,
      filters
    );

    // Step 5: If we filtered out too many results, we might need more data
    // This is a trade-off between performance and accuracy
    let finalResults = filteredServices;

    // Step 6: Enhance with consultant information
    const enhancedResults = await Promise.all(
      finalResults.map((service) =>
        enhanceServiceWithConsultantInfo(ctx, service)
      )
    );

    return {
      ...results,
      page: enhancedResults,
    };
  },
});

// Optimized filter application function
async function applyFiltersToServices(
  ctx: GenericQueryCtx<any>,
  services: Doc<"services">[],
  filters: any
): Promise<Doc<"services">[]> {
  let filteredServices = services;

  // Apply price filters
  if (
    filters.price !== undefined ||
    filters.price_min !== undefined ||
    filters.price_max !== undefined
  ) {
    const minPrice = filters.price_min ?? filters.price ?? 0;
    const maxPrice =
      filters.price_max ?? filters.price ?? Number.MAX_SAFE_INTEGER;

    filteredServices = filteredServices.filter(
      (service) => service.price >= minPrice && service.price <= maxPrice
    );
  }

  // Apply duration filter
  if (filters.meetingDuration !== undefined) {
    filteredServices = filteredServices.filter(
      (service) => service.duration === filters.meetingDuration
    );
  }

  // Apply category filter
  if (filters.category) {
    // First get the category ID
    const category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), filters.category))
      .first();

    if (category) {
      filteredServices = filteredServices.filter(
        (service) => service.categoryId === category._id
      );
    }
  }

  // Apply consultant-based filters (rating, experience, languages)
  if (
    filters.rating !== undefined ||
    filters.experience_min !== undefined ||
    filters.experience_max !== undefined ||
    filters.spokenLanguages?.length > 0
  ) {
    // Get consultant profiles for remaining services
    const consultantIds = [
      ...new Set(filteredServices.map((s) => s.consultantId)),
    ];
    const consultantProfiles = await Promise.all(
      consultantIds.map(async (consultantId) => {
        const profile = await ctx.db
          .query("consultantProfiles")
          .withIndex("byUserId", (q) => q.eq("userId", consultantId))
          .first();
        return { consultantId, profile };
      })
    );

    const consultantProfileMap = new Map(
      consultantProfiles.map(({ consultantId, profile }) => [
        consultantId,
        profile,
      ])
    );

    filteredServices = filteredServices.filter((service) => {
      const profile = consultantProfileMap.get(service.consultantId);
      if (!profile) return false;

      // Rating filter
      if (filters.rating !== undefined) {
        if (!profile.averageRating || profile.averageRating < filters.rating) {
          return false;
        }
      }

      // Experience filter
      if (
        filters.experience_min !== undefined ||
        filters.experience_max !== undefined
      ) {
        const minExp = filters.experience_min ?? 0;
        const maxExp = filters.experience_max ?? Number.MAX_SAFE_INTEGER;

        if (
          !profile.yearsOfExperience ||
          profile.yearsOfExperience < minExp ||
          profile.yearsOfExperience > maxExp
        ) {
          return false;
        }
      }

      // Language filter
      if (filters.spokenLanguages?.length > 0) {
        if (
          !profile.spokenLanguages ||
          !filters.spokenLanguages.some((lang: string) =>
            profile.spokenLanguages?.includes(lang)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }

  // Apply availability date filters
  if (
    filters.availableDates ||
    filters.availableDates_start ||
    filters.availableDates_end
  ) {
    const targetDate = filters.availableDates;
    const startDate = filters.availableDates_start;
    const endDate = filters.availableDates_end;

    // Get consultant availability for remaining services
    const consultantIds = [
      ...new Set(filteredServices.map((s) => s.consultantId)),
    ];
    const availabilityMap = new Map();

    for (const consultantId of consultantIds) {
      const availability = await ctx.db
        .query("consultantAvailability")
        .withIndex("byUserId", (q) => q.eq("userId", consultantId))
        .collect();
      availabilityMap.set(consultantId, availability);
    }

    filteredServices = filteredServices.filter((service) => {
      const availability = availabilityMap.get(service.consultantId) || [];

      if (targetDate) {
        const date = new Date(targetDate);
        const dayName = date.toLocaleDateString("en-US", {
          weekday: "long",
        }) as any;
        return availability.some(
          (avail: any) =>
            avail.dayOfWeek === dayName &&
            avail.isActive &&
            avail.timeRanges.length > 0
        );
      }

      // For date range, check if consultant has any availability in the range
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Simple check: if consultant has any active availability
        return availability.some(
          (avail: any) => avail.isActive && avail.timeRanges.length > 0
        );
      }

      return true;
    });
  }

  return filteredServices;
}

// Enhanced service info function (reused from consultantServices.ts)
async function enhanceServiceWithConsultantInfo(
  ctx: GenericQueryCtx<any>,
  service: Doc<"services">
) {
  // Get consultant profile
  const consultantProfile = await ctx.db
    .query("consultantProfiles")
    .withIndex("byUserId", (q) => q.eq("userId", service.consultantId))
    .first();

  // Get consultant user info
  const consultant = await ctx.db.get(service.consultantId);

  // Get category info
  const category = await ctx.db.get(service.categoryId);

  // Get recent reviews for this consultant (last 3)
  const recentReviews = await ctx.db
    .query("reviews")
    .withIndex("byConsultantId", (q) =>
      q.eq("consultantId", service.consultantId)
    )
    .order("desc")
    .take(3);

  // Get review statistics
  const allReviews = await ctx.db
    .query("reviews")
    .withIndex("byConsultantId", (q) =>
      q.eq("consultantId", service.consultantId)
    )
    .collect();

  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
          (allReviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews) *
            10
        ) / 10
      : 0;

  // Get reviews with user information
  const reviewsWithUsers = await Promise.all(
    recentReviews.map(async (review) => {
      const reviewUser = await ctx.db.get(review.userId);
      return {
        ...review,
        user: {
          firstName: reviewUser?.firstName,
          lastName: reviewUser?.lastName,
          imageUrl: reviewUser?.imageUrl,
        },
      };
    })
  );

  return {
    ...service,
    consultant: {
      firstName: consultant?.firstName,
      lastName: consultant?.lastName,
      imageUrl: consultant?.imageUrl,
      role: consultant?.role,
    },
    consultantProfile: consultantProfile
      ? {
          bio: consultantProfile.bio,
          yearsOfExperience: consultantProfile.yearsOfExperience,
          spokenLanguages: consultantProfile.spokenLanguages,
          averageRating: consultantProfile.averageRating || averageRating,
          totalReviews: consultantProfile.totalReviews || totalReviews,
        }
      : null,
    category: category
      ? {
          name: category.name,
          name_ar: category.name_ar,
          description: category.description,
          iconClassName: category.iconClassName,
          iconName: category.iconName,
        }
      : null,
    reviewStats: {
      averageRating,
      totalReviews,
    },
    recentReviews: reviewsWithUsers,
  };
}

// Helper query to get filter options dynamically
export const getFilterOptions = query({
  handler: async (ctx) => {
    // Get available categories
    const categories = await ctx.db.query("categories").collect();

    // Get price range from services
    const services = await ctx.db.query("services").collect();
    const prices = services.map((s) => s.price);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    // Get available durations
    const durations = [...new Set(services.map((s) => s.duration))].sort(
      (a, b) => a - b
    );

    // Get experience range from consultant profiles
    const consultantProfiles = await ctx.db
      .query("consultantProfiles")
      .collect();
    const experiences = consultantProfiles
      .map((p) => p.yearsOfExperience)
      .filter((exp) => exp !== undefined) as number[];

    const experienceRange =
      experiences.length > 0
        ? {
            min: Math.min(...experiences),
            max: Math.max(...experiences),
          }
        : { min: 0, max: 20 };

    // Get available languages
    const languages = new Set<string>();
    consultantProfiles.forEach((profile) => {
      profile.spokenLanguages?.forEach((lang) => languages.add(lang));
    });

    return {
      categories: categories.map((c) => ({
        label: c.name,
        value: c.name,
      })),
      priceRange,
      durations: durations.map((d) => ({
        label:
          d >= 60
            ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ""}`
            : `${d}m`,
        value: d,
      })),
      experienceRange,
      languages: Array.from(languages).map((lang) => ({
        label: getLanguageLabel(lang),
        value: lang,
      })),
    };
  },
});

// Helper function to get language labels
function getLanguageLabel(code: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    ar: "Arabic",
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    hi: "Hindi",
  };
  return languageMap[code] || code;
}
