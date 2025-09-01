import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { GenericQueryCtx, paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { faker } from "@faker-js/faker";

export const getServiceById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, { serviceId }) => {
    console.log("Fetching service with ID:", serviceId);
    try {
      const service = await ctx.db.get(serviceId);
      if (!service) {
        console.log("Service not found");
        throw new Error("Service not found");
      }

      // Enhance the service with consultant profile and review information
      const enhancedService = await enhanceServiceWithConsultantInfo(
        ctx,
        service
      );

      return enhancedService;
    } catch (error) {
      console.error("Error fetching service:", error);
      throw new Error("Failed to fetch service");
    }
  },
});

// export const createService = mutation({
//   args: {
//     name: v.string(),
//     categoryId: v.id("categories"),
//     price: v.number(),
//     duration: v.number(),
//   },
//   handler: async (ctx, { name, categoryId, price, duration }) => {
//     const currentUser = ctx.runQuery(api.user.current);

//     const serviceId = await ctx.db.insert("services", {
//       name,
//       categoryId,
//       price,
//       duration,
//       consultantId: currentUser.,
//       description: "test",
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });
//     return serviceId;
//   },
// });

export const createService = mutation({
  args: {
    name: v.string(),
    categoryId: v.id("categories"),
    price: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, { name, categoryId, price, duration }) => {
    const currentUser = await ctx.runQuery(api.user.current);

    if (!currentUser) {
      throw new Error("User not found");
    }

    await ctx.db.insert("services", {
      name,
      categoryId,
      price,
      duration,
      consultantId: currentUser._id,
      description: "test",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      status: "success",
    };
  },
});

export const createFakeConsultantData = mutation({
  args: {},
  handler: async (ctx) => {
    const targetUserId = "j577p0wkm7vhfrhyks756xzyrd7p9td1" as Id<"users">;

    // First, check if the user exists
    const user = await ctx.db.get(targetUserId);
    if (!user) {
      throw new Error("Target user not found");
    }

    // 1. Create Consultant Profile
    const existingProfile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", targetUserId))
      .first();

    let consultantProfileId;
    if (!existingProfile) {
      consultantProfileId = await ctx.db.insert("consultantProfiles", {
        userId: targetUserId,
        clerkUserId: user.clerkUserId,
        bio: faker.person.bio(),
        yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
        spokenLanguages: faker.helpers.arrayElements(
          ["en", "ar", "fr", "es", "de"],
          { min: 2, max: 4 }
        ),
        averageRating: parseFloat(
          faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }).toFixed(1)
        ),
        totalReviews: faker.number.int({ min: 10, max: 150 }),
        createdAt:
          Date.now() - faker.number.int({ min: 86400000, max: 31536000000 }), // Random date within last year
        updatedAt: Date.now(),
      });
    } else {
      consultantProfileId = existingProfile._id;
    }

    // 2. Get or create a category for services
    let category = await ctx.db.query("categories").first();
    if (!category) {
      // Create a default category if none exists
      const categoryId = await ctx.db.insert("categories", {
        name: "Business Consulting",
        description: "Professional business consultation services",
        iconClassName: "briefcase",
        iconName: "briefcase",
      });
      category = await ctx.db.get(categoryId);
    }

    if (!category) {
      throw new Error("Failed to create or find category");
    }

    // 3. Create Services
    const serviceCategories = [
      {
        name: "Business Strategy",
        services: [
          {
            name: "Strategic Planning Session",
            description:
              "Comprehensive business strategy development and planning for growth",
            price: faker.number.int({ min: 150, max: 300 }),
            duration: faker.helpers.arrayElement([60, 90, 120]),
          },
          {
            name: "Market Analysis Consultation",
            description:
              "In-depth market research and competitive analysis for your industry",
            price: faker.number.int({ min: 120, max: 250 }),
            duration: faker.helpers.arrayElement([45, 60, 90]),
          },
          {
            name: "Business Model Innovation",
            description:
              "Redesign and optimize your business model for maximum efficiency",
            price: faker.number.int({ min: 200, max: 400 }),
            duration: faker.helpers.arrayElement([90, 120, 150]),
          },
        ],
      },
      {
        name: "Financial Consulting",
        services: [
          {
            name: "Financial Health Assessment",
            description:
              "Complete financial review and optimization recommendations",
            price: faker.number.int({ min: 180, max: 350 }),
            duration: faker.helpers.arrayElement([60, 90]),
          },
          {
            name: "Investment Strategy Planning",
            description:
              "Personalized investment planning and portfolio optimization",
            price: faker.number.int({ min: 250, max: 500 }),
            duration: faker.helpers.arrayElement([90, 120]),
          },
        ],
      },
      {
        name: "Digital Transformation",
        services: [
          {
            name: "Digital Strategy Roadmap",
            description:
              "Complete digital transformation planning and implementation strategy",
            price: faker.number.int({ min: 200, max: 400 }),
            duration: faker.helpers.arrayElement([90, 120, 150]),
          },
          {
            name: "Technology Stack Consultation",
            description:
              "Expert advice on technology selection and implementation",
            price: faker.number.int({ min: 150, max: 300 }),
            duration: faker.helpers.arrayElement([60, 90]),
          },
        ],
      },
    ];

    const serviceIds = [];
    for (const serviceCategory of serviceCategories) {
      for (const service of serviceCategory.services) {
        const serviceId = await ctx.db.insert("services", {
          consultantId: targetUserId,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          categoryId: category._id,
          createdAt:
            Date.now() - faker.number.int({ min: 86400000, max: 15552000000 }), // Random date within last 6 months
          updatedAt: Date.now(),
        });
        serviceIds.push(serviceId);
      }
    }

    // 4. Create dummy users for reviews
    const reviewerIds = [];
    for (let i = 0; i < 15; i++) {
      const reviewerId = await ctx.db.insert("users", {
        phonenumber: faker.phone.number(),
        clerkUserId: faker.string.alphanumeric(32),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        imageUrl: faker.image.avatar(),
        createdAt:
          Date.now() - faker.number.int({ min: 86400000, max: 31536000000 }),
        updatedAt: Date.now(),
        role: "user" as const,
        onBoardingCompleted: true,
      });
      reviewerIds.push(reviewerId);
    }

    // 5. Create Reviews
    const reviewIds = [];
    const reviewTexts = [
      "Excellent consultant! Very professional and provided actionable insights.",
      "Great experience working with this consultant. Highly recommend!",
      "Very knowledgeable and helped us solve complex business challenges.",
      "Professional service and clear communication throughout the process.",
      "Outstanding expertise in business strategy. Worth every penny!",
      "Helped transform our business approach. Fantastic results!",
      "Clear, concise, and extremely helpful consultation session.",
      "Exceeded expectations with detailed analysis and recommendations.",
      "Great consultant with deep industry knowledge and practical solutions.",
      "Very satisfied with the consultation. Will definitely book again!",
      "Professional, punctual, and provided valuable insights for our business.",
      "Excellent communication skills and provided practical actionable advice.",
      "Helped us identify key growth opportunities. Highly recommended!",
      "Very thorough analysis and clear next steps provided.",
      "Great value for money. Professional and insightful consultation.",
    ];

    for (let i = 0; i < 25; i++) {
      const rating = faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 4, value: 4 },
        { weight: 2, value: 3 },
        { weight: 1, value: 2 },
        { weight: 0.5, value: 1 },
      ]);

      const reviewId = await ctx.db.insert("reviews", {
        userId: faker.helpers.arrayElement(reviewerIds),
        consultantId: targetUserId,
        rating: rating,
        comment: faker.helpers.arrayElement(reviewTexts),
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
        createdAt:
          Date.now() - faker.number.int({ min: 86400000, max: 15552000000 }), // Random date within last 6 months
        updatedAt: Date.now(),
      });
      reviewIds.push(reviewId);
    }

    // 6. Create some availability slots
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ] as const;

    for (const day of daysOfWeek) {
      const isActive = faker.datatype.boolean({ probability: 0.8 }); // 80% chance the day is available

      if (isActive) {
        const timeRanges = [];

        // Morning slot
        if (faker.datatype.boolean({ probability: 0.7 })) {
          timeRanges.push({
            startTime: "09:00",
            endTime: "12:00",
          });
        }

        // Afternoon slot
        if (faker.datatype.boolean({ probability: 0.8 })) {
          timeRanges.push({
            startTime: "14:00",
            endTime: "17:00",
          });
        }

        // Evening slot
        if (faker.datatype.boolean({ probability: 0.4 })) {
          timeRanges.push({
            startTime: "18:00",
            endTime: "20:00",
          });
        }

        await ctx.db.insert("consultantAvailability", {
          userId: targetUserId,
          dayOfWeek: day,
          timeRanges: timeRanges,
          isActive: timeRanges.length > 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return {
      message: "Successfully created comprehensive fake consultant data",
      data: {
        consultantProfileId,
        serviceCount: serviceIds.length,
        reviewCount: reviewIds.length,
        reviewerCount: reviewerIds.length,
        availabilityDays: daysOfWeek.length,
      },
    };
  },
});

// Clean up function to remove fake data for the target user
export const cleanupFakeConsultantData = mutation({
  args: {},
  handler: async (ctx) => {
    const targetUserId = "j577p0wkm7vhfrhyks756xzyrd7p9td1" as Id<"users">;

    // Delete consultant profile
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", targetUserId))
      .first();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Delete services
    const services = await ctx.db
      .query("services")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", targetUserId))
      .collect();
    for (const service of services) {
      await ctx.db.delete(service._id);
    }

    // Delete reviews where this user is the consultant
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", targetUserId))
      .collect();
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // Delete availability
    const availability = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserId", (q) => q.eq("userId", targetUserId))
      .collect();
    for (const slot of availability) {
      await ctx.db.delete(slot._id);
    }

    // Note: We're not deleting the fake reviewer users as they might be used elsewhere
    // If you want to delete them too, you would need to track which users were created as fake reviewers

    return {
      message: "Successfully cleaned up fake consultant data",
      deletedCounts: {
        profiles: profile ? 1 : 0,
        services: services.length,
        reviews: reviews.length,
        availability: availability.length,
      },
    };
  },
});

export const createFakeServices = mutation({
  args: {},
  handler: async (ctx) => {
    const consultantUserId = "j577p0wkm7vhfrhyks756xzyrd7p9td1" as Id<"users">;

    const fakeServices = [
      {
        consultantId: consultantUserId,
        name: "Business Strategy Consultation",
        description:
          "Comprehensive business strategy planning and analysis for startups and established companies",
        price: 150,
        duration: 60,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Financial Planning Review",
        description:
          "Personal and business financial planning with investment recommendations",
        price: 200,
        duration: 90,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Digital Marketing Strategy",
        description:
          "Social media and online marketing strategy development for modern businesses",
        price: 120,
        duration: 45,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Career Coaching Session",
        description:
          "One-on-one career guidance and professional development coaching",
        price: 80,
        duration: 60,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Technology Consultation",
        description:
          "IT infrastructure planning and technology adoption recommendations",
        price: 180,
        duration: 75,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Legal Advisory Session",
        description:
          "Business legal compliance and contract review consultation",
        price: 250,
        duration: 60,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Project Management Training",
        description:
          "Agile and traditional project management methodology training",
        price: 100,
        duration: 120,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        consultantId: consultantUserId,
        name: "Sales Process Optimization",
        description:
          "Sales funnel analysis and conversion rate optimization strategies",
        price: 160,
        duration: 90,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // get first category and add its id
    const categoryId = (await ctx.db.query("categories").first())?._id;
    if (!categoryId) {
      throw new Error("No categories found. Please create a category first.");
    }
    // Insert all fake services
    const serviceIds = [];
    for (const service of fakeServices) {
      const serviceId = await ctx.db.insert("services", {
        ...service,
        categoryId: categoryId,
      });
      serviceIds.push(serviceId);
    }

    return {
      message: `Successfully created ${fakeServices.length} fake services`,
      serviceIds,
    };
  },
});

export const listAllServices = query({
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();

    // Enhance each service with consultant profile and review information
    const enhancedServices = await Promise.all(
      services.map(
        async (service) => await enhanceServiceWithConsultantInfo(ctx, service)
      )
    );

    return enhancedServices;
  },
});

// export const getCurrentConsultantServicesByClerkUserId = query({
//   args: { },
//   handler: async (ctx) => {
//     const currentUser = await ctx.runQuery(api.user.current);

//     if (!currentUser) {
//       throw new Error("User not found");
//     }

//     return await ctx.db
//       .query("services")
//       .withIndex("byConsultantId", (q) => q.eq("consultantId", currentUser.id))
//       .collect();
//   },
// });

export const getCurrentConsultantServices = query({
  handler: async (ctx): Promise<Doc<"services">[]> => {
    const currentUser = await ctx.runQuery(api.user.current);

    if (!currentUser) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("services")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", currentUser._id))
      .collect();
  },
});

export const searchServices = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }) => {
    let services;

    // If query is empty, return all services
    if (!query || query.trim() === "") {
      services = await ctx.db.query("services").take(10);
    } else {
      services = await ctx.db
        .query("services")
        .withSearchIndex("search_body", (q) => q.search("name", query))
        .take(10);
    }

    // Enhance each service with consultant profile and review information
    const enhancedServices = await Promise.all(
      services.map(
        async (service) => await enhanceServiceWithConsultantInfo(ctx, service)
      )
    );

    return enhancedServices;
  },
});

// Helper function to enhance service with consultant profile and review information
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

export const getServicesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    query: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, query }) => {
    // If query is empty or not provided, return paginated all services using built-in pagination
    if (!query || query.trim() === "") {
      const results = await ctx.db
        .query("services")
        .order("desc")
        .paginate(paginationOpts);

      // Enhance each service with consultant profile and review information
      const enhancedPage = await Promise.all(
        results.page.map(
          async (service) =>
            await enhanceServiceWithConsultantInfo(ctx, service)
        )
      );

      return {
        ...results,
        page: enhancedPage,
      };
    }

    // For search queries, we need to use a different approach
    // Since we can't easily paginate search results, we'll use the regular pagination
    // and then filter on the results for search
    const results = await ctx.db
      .query("services")
      .order("desc")
      .paginate(paginationOpts);

    // Filter the page results by the search query
    const filteredPage = results.page.filter((service) =>
      service.name.toLowerCase().includes(query.toLowerCase())
    );

    // Enhance filtered services with consultant profile and review information
    const enhancedFilteredPage = await Promise.all(
      filteredPage.map(
        async (service) => await enhanceServiceWithConsultantInfo(ctx, service)
      )
    );

    return {
      ...results,
      page: enhancedFilteredPage,
    };
  },
});
