import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  UserAccount,
  StudentProfile,
  MealMenu,
  MealConfirmation,
  CanteenInventoryItem,
  SurplusListing,
  FoodClaim,
  FoodInspection,
  RedistributionRecord,
  FoodFeedback,
  AppNotification,
  AchievementBadge,
  DemandPredictionRecord,
  HistoricalDailyRecord,
  GENERATED_IMAGES,
  ECO_ASSUMPTIONS,
} from '../types/rebite';

const STORAGE_KEY = 'rebite_campus_platform_v2';

export const DEMO_USERS: Record<UserRole, UserAccount> = {
  [UserRole.STUDENT]: {
    id: 'usr-student-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@iitb-campus.ac.in',
    role: UserRole.STUDENT,
    campusUnit: 'Vindhya Hostel Block B · Room 314',
    verifiedId: '22B0841',
    createdAt: '2026-08-01T09:00:00Z',
  },
  [UserRole.MESS_MANAGER]: {
    id: 'usr-mess-201',
    name: 'Rajeshwar Nair',
    email: 'r.nair.mess@iitb-campus.ac.in',
    role: UserRole.MESS_MANAGER,
    campusUnit: 'Aravalli & Vindhya Central Dining Mess',
    verifiedId: 'MESS-MGR-04',
    createdAt: '2026-07-15T08:00:00Z',
  },
  [UserRole.CANTEEN_MANAGER]: {
    id: 'usr-canteen-301',
    name: 'Priya Deshmukh',
    email: 'priya.canteen@iitb-campus.ac.in',
    role: UserRole.CANTEEN_MANAGER,
    campusUnit: 'Gulmohar Academic Core Canteen',
    verifiedId: 'CNT-LIC-19',
    createdAt: '2026-07-20T08:30:00Z',
  },
  [UserRole.NGO_INSPECTOR]: {
    id: 'usr-ngo-401',
    name: 'Dr. Kavita Menon',
    email: 'kavita.menon@robinhood-campus.org',
    role: UserRole.NGO_INSPECTOR,
    campusUnit: 'Feeding Hope NGO · FSSAI Campus Quality Partner',
    verifiedId: 'FSSAI-INSP-88412',
    createdAt: '2026-07-10T10:00:00Z',
  },
};

interface CampusDatabaseState {
  users: UserAccount[];
  studentProfile: StudentProfile;
  leaderboard: {
    id: string;
    name: string;
    hostel: string;
    mealsConfirmed: number;
    surplusClaimed: number;
    foodSavedKg: number;
    points: number;
  }[];
  mealMenus: MealMenu[];
  mealConfirmations: MealConfirmation[];
  canteenInventory: CanteenInventoryItem[];
  surplusListings: SurplusListing[];
  foodClaims: FoodClaim[];
  foodInspections: FoodInspection[];
  redistributionRecords: RedistributionRecord[];
  foodFeedback: FoodFeedback[];
  notifications: AppNotification[];
  achievements: AchievementBadge[];
  demandPredictions: DemandPredictionRecord[];
  historicalRecords: HistoricalDailyRecord[];
}

const INITIAL_DB_STATE: CampusDatabaseState = {
  users: Object.values(DEMO_USERS),
  studentProfile: {
    userId: DEMO_USERS[UserRole.STUDENT].id,
    name: DEMO_USERS[UserRole.STUDENT].name,
    rollNumber: '22B0841',
    hostel: 'Vindhya Hostel Block B',
    dietaryPreference: 'Vegetarian',
    portionSize: 'Standard',
    spicePreference: 'Medium',
    mealsConfirmedCount: 42,
    mealsClaimedCount: 9,
    foodSavedKg: 14.8,
    sustainabilityScore: 91,
    points: 680,
    streakDays: 11,
    remindersEnabled: true,
  },
  leaderboard: [
    {
      id: 'stu-1',
      name: 'Ananya Verma',
      hostel: 'Sarayu Hostel',
      mealsConfirmed: 49,
      surplusClaimed: 12,
      foodSavedKg: 18.4,
      points: 790,
    },
    {
      id: 'usr-student-101',
      name: 'Aarav Sharma',
      hostel: 'Vindhya Hostel Block B',
      mealsConfirmed: 42,
      surplusClaimed: 9,
      foodSavedKg: 14.8,
      points: 680,
    },
    {
      id: 'stu-3',
      name: 'Rohan Kulkarni',
      hostel: 'Aravalli Hostel',
      mealsConfirmed: 39,
      surplusClaimed: 8,
      foodSavedKg: 13.2,
      points: 615,
    },
    {
      id: 'stu-4',
      name: 'Meera Krishnan',
      hostel: 'Tapti Hostel',
      mealsConfirmed: 36,
      surplusClaimed: 7,
      foodSavedKg: 11.6,
      points: 560,
    },
    {
      id: 'stu-5',
      name: 'Siddharth Joshi',
      hostel: 'Nilgiri Hostel',
      mealsConfirmed: 33,
      surplusClaimed: 5,
      foodSavedKg: 9.8,
      points: 490,
    },
  ],
  mealMenus: [
    {
      id: 'meal-breakfast-today',
      date: '2026-11-25',
      dayOfWeek: 'Wednesday',
      mealType: 'Breakfast',
      servingWindow: '07:30 AM – 09:30 AM',
      cutoffTime: '06:30 AM',
      messName: 'Aravalli & Vindhya Central Mess',
      expectedStudents: 620,
      confirmedCount: 548,
      cancelledCount: 72,
      status: 'Completed',
      items: [
        { id: 'mi-1', name: 'Masala Dosa & Coconut Chutney', category: 'Main', plannedKg: 110, preparedKg: 102, consumedKg: 98.5 },
        { id: 'mi-2', name: 'Udipi Vegetable Sambar', category: 'Accompaniment', plannedKg: 75, preparedKg: 70, consumedKg: 66.2 },
        { id: 'mi-3', name: 'Sprouted Moong & Boiled Chickpeas', category: 'Staple', plannedKg: 40, preparedKg: 38, consumedKg: 36.8 },
      ],
    },
    {
      id: 'meal-lunch-today',
      date: '2026-11-25',
      dayOfWeek: 'Wednesday',
      mealType: 'Lunch',
      servingWindow: '12:15 PM – 02:30 PM',
      cutoffTime: '10:30 AM',
      messName: 'Aravalli & Vindhya Central Mess',
      expectedStudents: 620,
      confirmedCount: 512,
      cancelledCount: 108,
      status: 'In-Service',
      items: [
        { id: 'mi-4', name: 'Paneer Butter Masala', category: 'Main', plannedKg: 96, preparedKg: 88, consumedKg: 76.5 },
        { id: 'mi-5', name: 'Dal Tadka (Yellow Lentils)', category: 'Main', plannedKg: 82, preparedKg: 76, consumedKg: 68.0 },
        { id: 'mi-6', name: 'Basmati Jeera Rice', category: 'Staple', plannedKg: 115, preparedKg: 102, consumedKg: 88.5 },
        { id: 'mi-7', name: 'Whole Wheat Phulka Rotis', category: 'Staple', plannedKg: 74, preparedKg: 68, consumedKg: 62.0 },
      ],
    },
    {
      id: 'meal-dinner-today',
      date: '2026-11-25',
      dayOfWeek: 'Wednesday',
      mealType: 'Dinner',
      servingWindow: '07:30 PM – 09:45 PM',
      cutoffTime: '05:30 PM',
      messName: 'Aravalli & Vindhya Central Mess',
      expectedStudents: 620,
      confirmedCount: 486,
      cancelledCount: 134,
      status: 'Upcoming',
      items: [
        { id: 'mi-8', name: 'Hyderabadi Vegetable Dum Biryani', category: 'Main', plannedKg: 145, preparedKg: 124, consumedKg: 0 },
        { id: 'mi-9', name: 'Mirchi Ka Salan & Boondi Raita', category: 'Accompaniment', plannedKg: 70, preparedKg: 62, consumedKg: 0 },
        { id: 'mi-10', name: 'Moong Dal Halwa', category: 'Beverage/Dessert', plannedKg: 48, preparedKg: 44, consumedKg: 0 },
      ],
    },
  ],
  mealConfirmations: [
    {
      id: 'mc-1',
      mealMenuId: 'meal-breakfast-today',
      studentId: 'usr-student-101',
      studentName: 'Aarav Sharma',
      status: 'Confirmed',
      portionPreference: 'Standard',
      updatedAt: '2026-11-25T05:50:00Z',
    },
    {
      id: 'mc-2',
      mealMenuId: 'meal-lunch-today',
      studentId: 'usr-student-101',
      studentName: 'Aarav Sharma',
      status: 'Confirmed',
      portionPreference: 'Standard',
      updatedAt: '2026-11-25T09:15:00Z',
    },
    {
      id: 'mc-3',
      mealMenuId: 'meal-dinner-today',
      studentId: 'usr-student-101',
      studentName: 'Aarav Sharma',
      status: 'Confirmed',
      portionPreference: 'Standard',
      updatedAt: '2026-11-25T11:00:00Z',
    },
  ],
  canteenInventory: [
    {
      id: 'inv-101',
      name: 'Punjabi Aloo Samosa (2 Pc Pack)',
      category: 'Hot Snacks',
      batchCode: 'CNT-SAM-25A',
      preparedAt: '11:00 AM',
      expiryTime: '06:30 PM',
      totalPreparedUnits: 120,
      remainingUnits: 28,
      unitWeightKg: 0.18,
      unitPriceInr: 30,
      discountedPriceInr: 12,
      status: 'Approaching Expiry',
    },
    {
      id: 'inv-102',
      name: 'Multigrain Veg Grilled Sandwich',
      category: 'Fresh Bakery',
      batchCode: 'CNT-SND-25B',
      preparedAt: '12:30 PM',
      expiryTime: '07:30 PM',
      totalPreparedUnits: 85,
      remainingUnits: 22,
      unitWeightKg: 0.25,
      unitPriceInr: 45,
      discountedPriceInr: 20,
      status: 'Approaching Expiry',
    },
    {
      id: 'inv-103',
      name: 'Baked Paneer Masala Puff',
      category: 'Fresh Bakery',
      batchCode: 'CNT-PUF-25C',
      preparedAt: '02:00 PM',
      expiryTime: '08:30 PM',
      totalPreparedUnits: 90,
      remainingUnits: 44,
      unitWeightKg: 0.15,
      unitPriceInr: 35,
      discountedPriceInr: 15,
      status: 'Fresh',
    },
    {
      id: 'inv-104',
      name: 'Rajma Chawal Mini Bowl',
      category: 'Packaged Meals',
      batchCode: 'CNT-RJM-25D',
      preparedAt: '01:00 PM',
      expiryTime: '06:00 PM',
      totalPreparedUnits: 60,
      remainingUnits: 14,
      unitWeightKg: 0.35,
      unitPriceInr: 65,
      discountedPriceInr: 0,
      status: 'Converted to Surplus',
    },
  ],
  surplusListings: [
    {
      id: 'surplus-101',
      sourceType: 'Mess',
      sourceName: 'Aravalli & Vindhya Central Mess',
      location: 'Hostel Sector 4 · North Dispatch Counter',
      foodName: 'Paneer Butter Masala, Dal Tadka & Jeera Rice Thali',
      description: 'Unhandled clean kitchen batch from lunch service held in covered stainless steel gastronorm pans above 63°C.',
      imageUrl: GENERATED_IMAGES.SURPLUS_PANEER_THALI,
      totalQuantityPortions: 45,
      remainingPortions: 32,
      weightPerPortionKg: 0.42,
      preparedAt: '12:00 PM',
      collectionDeadline: '04:30 PM Today',
      storageCondition: 'Hot Holding Bain-Marie (64°C)',
      storageTempCelsius: 64,
      packagingCondition: 'Food-grade 304 Stainless Steel Sealed Containers',
      priceType: 'Free',
      priceInr: 0,
      originalPriceInr: 85,
      suitableForNgoBulk: true,
      status: 'Available',
      createdAt: '2026-11-25T14:20:00Z',
    },
    {
      id: 'surplus-102',
      sourceType: 'Canteen',
      sourceName: 'Gulmohar Academic Core Canteen',
      location: 'Academic Block C · Ground Floor Counter 2',
      foodName: 'Assorted Samosas, Veg Grilled Sandwiches & Masala Puffs',
      description: 'Fresh afternoon bakery & snack batch available for student evening pickup in biodegradable kraft boxes.',
      imageUrl: GENERATED_IMAGES.SURPLUS_CANTEEN_SNACKS,
      totalQuantityPortions: 30,
      remainingPortions: 18,
      weightPerPortionKg: 0.28,
      preparedAt: '01:15 PM',
      collectionDeadline: '07:00 PM Today',
      storageCondition: 'Warm Display Cabinet (58°C)',
      storageTempCelsius: 58,
      packagingCondition: 'Biodegradable Clamshell Trays',
      priceType: 'Discounted',
      priceInr: 15,
      originalPriceInr: 45,
      suitableForNgoBulk: false,
      status: 'Partially Claimed',
      createdAt: '2026-11-25T15:10:00Z',
    },
    {
      id: 'surplus-103',
      sourceType: 'Mess',
      sourceName: 'Nilgiri PG Dining Hall',
      location: 'PG Hostel Complex · Gate 2 Loading Bay',
      foodName: 'Hyderabadi Vegetable Dum Biryani & Raita (Faculty Event Surplus)',
      description: 'Unserved catering batch from department seminar lunch. Stored immediately in insulated hot-boxes.',
      imageUrl: GENERATED_IMAGES.SURPLUS_VEG_BIRYANI,
      totalQuantityPortions: 60,
      remainingPortions: 60,
      weightPerPortionKg: 0.45,
      preparedAt: '01:00 PM',
      collectionDeadline: '05:15 PM Today',
      storageCondition: 'Insulated Thermal Carrier (65°C)',
      storageTempCelsius: 65,
      packagingCondition: 'Sealed Gastronorm Pans with Timestamp Seal',
      priceType: 'Free',
      priceInr: 0,
      originalPriceInr: 110,
      suitableForNgoBulk: true,
      status: 'NGO Approved',
      createdAt: '2026-11-25T14:45:00Z',
    },
  ],
  foodClaims: [
    {
      id: 'claim-101',
      surplusId: 'surplus-102',
      foodName: 'Assorted Samosas, Veg Grilled Sandwiches & Masala Puffs',
      sourceName: 'Gulmohar Academic Core Canteen',
      location: 'Academic Block C · Ground Floor Counter 2',
      claimantId: 'usr-student-101',
      claimantName: 'Aarav Sharma',
      claimantRole: UserRole.STUDENT,
      portionsClaimed: 2,
      weightKg: 0.56,
      pickupCode: 'RB-7492',
      pickupDeadline: '07:00 PM Today',
      status: 'Reserved',
      claimedAt: '2026-11-25T15:25:00Z',
    },
  ],
  foodInspections: [
    {
      id: 'insp-101',
      surplusId: 'surplus-103',
      foodName: 'Hyderabadi Vegetable Dum Biryani & Raita (Faculty Event Surplus)',
      sourceName: 'Nilgiri PG Dining Hall',
      inspectorId: 'usr-ngo-401',
      inspectorName: 'Dr. Kavita Menon',
      inspectorLicense: 'FSSAI-INSP-88412',
      prepTime: '01:00 PM',
      storageTemp: '65°C (Hot Box) / 4°C (Raita Chiller)',
      storageDurationHours: 2.2,
      packagingCondition: 'Sealed Gastronorm Pans with Timestamp Seal',
      transportCondition: 'Insulated NGO Van with Active Thermal Box',
      imageUrl: GENERATED_IMAGES.SURPLUS_VEG_BIRYANI,
      aiObservations: {
        visualFreshnessObservations: [
          'Rice grains appear distinct, vibrant, and free of excess moisture or clumping.',
          'Fresh coriander garnish shows crisp coloration with no wilting or discoloration.',
          'Stainless steel gastronorm container rim appears clean and properly handled.',
        ],
        possibleQualityConcerns: [
          'Accompanying dairy raita must be kept strictly separated in cold chain (<5°C) away from the 65°C biryani.',
          'Batch must be distributed and consumed within 2 hours of dispatch to stay within the 4-hour hot-holding window.',
        ],
        missingSafetyInformation: [
          'Physical core temperature probe reading from the center of the biryani pan.',
          'Confirmation of allergen notice (cashews/dairy/ghee used in preparation).',
        ],
        recommendedNextInspectionSteps: [
          'Insert calibrated digital thermometer into center of batch to verify core temp >= 60°C.',
          'Perform organoleptic aroma check on both biryani and raita.',
          'Seal lid with tamper-evident NGO redistribution tag.',
        ],
        riskLevelIndicator: 'Standard Physical Verification Required',
        mandatorySafetyDisclaimer:
          'AI visual observations cannot certify food as safe to eat. Mandatory physical thermometer verification and organoleptic inspection by an authorized human inspector are required before distribution.',
      },
      humanVerifiedThermometer: true,
      humanVerifiedSensory: true,
      humanVerifiedPackaging: true,
      humanInspectorNotes: 'Core probe verified at 64.8°C. Raita stored separately at 3.8°C. Approved for immediate dispatch to Powai Labor Camp Community Center.',
      decision: 'Approved for Redistribution',
      inspectedAt: '2026-11-25T15:05:00Z',
    },
  ],
  redistributionRecords: [
    {
      id: 'redist-101',
      surplusId: 'surplus-prev-01',
      inspectionId: 'insp-prev-01',
      foodName: 'Dal Makhani, Chapati & Mixed Veg Curry',
      sourceName: 'Aravalli & Vindhya Central Mess',
      ngoName: 'Feeding Hope NGO · Campus Chapter',
      inspectorName: 'Dr. Kavita Menon',
      quantityReceivedPortions: 75,
      quantityDistributedPortions: 75,
      weightSavedKg: 31.5,
      beneficiaryCommunity: 'Kanjurmarg Night Shelter & Community School',
      beneficiariesCount: 75,
      collectionStatus: 'Distributed',
      distributedAt: '2026-11-24T21:15:00Z',
    },
    {
      id: 'redist-102',
      surplusId: 'surplus-prev-02',
      inspectionId: 'insp-prev-02',
      foodName: 'Chole Bhature & Pulav Rice Batch',
      sourceName: 'Sarayu Hostel Mess',
      ngoName: 'Robin Hood Army · Zone 3',
      inspectorName: 'Dr. Kavita Menon',
      quantityReceivedPortions: 58,
      quantityDistributedPortions: 58,
      weightSavedKg: 24.4,
      beneficiaryCommunity: 'Powai Construction Workers Family Settlement',
      beneficiariesCount: 58,
      collectionStatus: 'Distributed',
      distributedAt: '2026-11-23T16:30:00Z',
    },
    {
      id: 'redist-103',
      surplusId: 'surplus-103',
      inspectionId: 'insp-101',
      foodName: 'Hyderabadi Vegetable Dum Biryani & Raita (Faculty Event Surplus)',
      sourceName: 'Nilgiri PG Dining Hall',
      ngoName: 'Feeding Hope NGO · Campus Chapter',
      inspectorName: 'Dr. Kavita Menon',
      quantityReceivedPortions: 60,
      quantityDistributedPortions: 60,
      weightSavedKg: 27.0,
      beneficiaryCommunity: 'Powai Community Learning Center',
      beneficiariesCount: 60,
      collectionStatus: 'In Transit',
      distributedAt: '2026-11-25T15:30:00Z',
    },
  ],
  foodFeedback: [
    {
      id: 'fb-101',
      studentId: 'usr-student-101',
      studentName: 'Aarav Sharma',
      mealMenuId: 'meal-breakfast-today',
      mealLabel: 'Breakfast · Masala Dosa & Sambar',
      rating: 5,
      qualityComment: 'Dosas were crisp and warm. Smaller initial serving scoops reduced plate waste significantly.',
      excessiveWasteObserved: false,
      wastedItemReported: 'None',
      createdAt: '2026-11-25T09:10:00Z',
    },
    {
      id: 'fb-102',
      studentId: 'stu-1',
      studentName: 'Ananya Verma',
      mealMenuId: 'meal-lunch-today',
      mealLabel: 'Lunch · Paneer Butter Masala & Jeera Rice',
      rating: 4,
      qualityComment: 'Paneer curry was great, but standard rice serving ladle is too large for light eaters.',
      excessiveWasteObserved: true,
      wastedItemReported: 'Basmati Jeera Rice',
      createdAt: '2026-11-25T13:45:00Z',
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      targetRoles: [UserRole.STUDENT, UserRole.NGO_INSPECTOR],
      title: '32 Portions of Paneer Thali Available at Central Mess',
      message: 'Aravalli & Vindhya Central Mess listed 32 free surplus portions (13.4 kg). Pickup open until 04:30 PM.',
      category: 'Surplus Alert',
      createdAt: '22 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      targetRoles: [UserRole.STUDENT],
      title: 'Dinner Attendance Cutoff in 1 Hour',
      message: 'Confirm or skip tonight’s Hyderabadi Veg Dum Biryani dinner before 05:30 PM to help optimize kitchen prep.',
      category: 'Meal Reminder',
      createdAt: '45 mins ago',
      read: false,
    },
    {
      id: 'notif-3',
      targetRoles: [UserRole.MESS_MANAGER, UserRole.NGO_INSPECTOR],
      title: 'FSSAI Inspector Approved Nilgiri Biryani Batch (27 kg)',
      message: 'Dr. Kavita Menon completed thermometer verification (64.8°C) and approved 60 portions for NGO dispatch.',
      category: 'NGO Inspection',
      createdAt: '1 hour ago',
      read: false,
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Zero-Waste Streak (10 Days)',
      description: 'Confirmed or updated meal attendance prior to kitchen cutoff for 10 consecutive days.',
      requiredAction: 'Confirm or cancel at least 10 meals on time',
      pointsAwarded: 150,
      unlocked: true,
      unlockedAt: '2026-11-22',
    },
    {
      id: 'ach-2',
      title: 'Surplus Rescue Champion',
      description: 'Claimed and collected at least 5 surplus meals from campus mess or canteen counters.',
      requiredAction: 'Claim 5 surplus portions',
      pointsAwarded: 200,
      unlocked: true,
      unlockedAt: '2026-11-24',
    },
    {
      id: 'ach-3',
      title: 'Kitchen Feedback Auditor',
      description: 'Submitted 3 constructive meal feedback reports helping mess managers calibrate portion ladles.',
      requiredAction: 'Submit 3 meal quality & waste feedback logs',
      pointsAwarded: 120,
      unlocked: false,
    },
    {
      id: 'ach-4',
      title: '20 kg Campus Carbon Saver',
      description: 'Prevented 20 kg of food waste through verified meal confirmations and surplus claims.',
      requiredAction: 'Reach 20 kg personal food saved',
      pointsAwarded: 300,
      unlocked: false,
    },
  ],
  demandPredictions: [
    {
      id: 'pred-dinner-today',
      mealMenuId: 'meal-dinner-today',
      mealLabel: 'Wednesday Dinner · Hyderabadi Veg Dum Biryani',
      date: '2026-11-25',
      predictedHeadcount: 508,
      actualHeadcount: null,
      recommendedTotalKg: 213.4,
      actualPreparedKg: 230.0,
      actualConsumedKg: 0,
      expectedSurplusKgIfUnadjusted: 47.0,
      confidenceNote:
        'Derived from 486 confirmed students (+4.5% historical walk-in buffer on Wednesday nights). Standard 620-student baseline prep would create ~47 kg of excess food.',
      itemRecommendations: [
        {
          itemName: 'Hyderabadi Vegetable Dum Biryani',
          plannedKg: 145,
          recommendedKg: 122,
          adjustmentReason: '134 students opted out of dinner; reduce raw basmati batch by 16% to prevent post-service surplus.',
        },
        {
          itemName: 'Mirchi Ka Salan & Boondi Raita',
          plannedKg: 70,
          recommendedKg: 58,
          adjustmentReason: 'Scale accompaniment proportionally to 508 predicted diners.',
        },
        {
          itemName: 'Moong Dal Halwa',
          plannedKg: 48,
          recommendedKg: 43,
          adjustmentReason: 'High consumption rate on dessert days; keep 5% buffer.',
        },
      ],
      actionableAdvice: [
        'Cook 122 kg of Veg Biryani in main batch + hold 12 kg of par-boiled rice for late-service demand spike.',
        'Switch rice serving spoon to standard 180g portion ladle to reduce plate leftovers reported at lunch.',
        'Notify Feeding Hope NGO by 09:15 PM if remaining unserved hot-box quantity exceeds 10 kg.',
      ],
      generatedAt: '2026-11-25T15:00:00Z',
    },
  ],
  historicalRecords: [
    {
      date: '2026-11-19',
      dayShort: 'Thu',
      isWeekend: false,
      expectedAttendance: 620,
      confirmedAttendance: 530,
      actualAttendance: 542,
      preparedKg: 685,
      consumedKg: 618,
      surplusRedistributedKg: 46,
      unavoidableWasteKg: 21,
      canteenUnsoldKg: 14,
      costSavedInr: 11200,
    },
    {
      date: '2026-11-20',
      dayShort: 'Fri',
      isWeekend: false,
      expectedAttendance: 620,
      confirmedAttendance: 490,
      actualAttendance: 504,
      preparedKg: 640,
      consumedKg: 576,
      surplusRedistributedKg: 48,
      unavoidableWasteKg: 16,
      canteenUnsoldKg: 12,
      costSavedInr: 12450,
    },
    {
      date: '2026-11-21',
      dayShort: 'Sat',
      isWeekend: true,
      expectedAttendance: 620,
      confirmedAttendance: 410,
      actualAttendance: 428,
      preparedKg: 545,
      consumedKg: 492,
      surplusRedistributedKg: 39,
      unavoidableWasteKg: 14,
      canteenUnsoldKg: 9,
      costSavedInr: 15800,
    },
    {
      date: '2026-11-22',
      dayShort: 'Sun',
      isWeekend: true,
      expectedAttendance: 620,
      confirmedAttendance: 435,
      actualAttendance: 448,
      preparedKg: 560,
      consumedKg: 512,
      surplusRedistributedKg: 36,
      unavoidableWasteKg: 12,
      canteenUnsoldKg: 8,
      costSavedInr: 14900,
    },
    {
      date: '2026-11-23',
      dayShort: 'Mon',
      isWeekend: false,
      expectedAttendance: 620,
      confirmedAttendance: 555,
      actualAttendance: 564,
      preparedKg: 690,
      consumedKg: 642,
      surplusRedistributedKg: 35,
      unavoidableWasteKg: 13,
      canteenUnsoldKg: 11,
      costSavedInr: 13100,
    },
    {
      date: '2026-11-24',
      dayShort: 'Tue',
      isWeekend: false,
      expectedAttendance: 620,
      confirmedAttendance: 540,
      actualAttendance: 552,
      preparedKg: 675,
      consumedKg: 629,
      surplusRedistributedKg: 34,
      unavoidableWasteKg: 12,
      canteenUnsoldKg: 10,
      costSavedInr: 13600,
    },
    {
      date: '2026-11-25',
      dayShort: 'Wed',
      isWeekend: false,
      expectedAttendance: 620,
      confirmedAttendance: 515,
      actualAttendance: 526,
      preparedKg: 648,
      consumedKg: 604,
      surplusRedistributedKg: 35,
      unavoidableWasteKg: 9,
      canteenUnsoldKg: 7,
      costSavedInr: 14850,
    },
  ],
};

interface ReBiteContextType {
  currentUser: UserAccount | null;
  activeView: 'landing' | 'auth' | 'dashboard';
  setActiveView: (view: 'landing' | 'auth' | 'dashboard') => void;
  goBack: () => void;
  canGoBack: boolean;
  loginAsRole: (role: UserRole) => void;
  registerOrLoginCustomUser: (name: string, email: string, role: UserRole, campusUnit: string, verifiedId: string) => void;
  logout: () => void;
  resetDemoDatabase: () => void;
  db: CampusDatabaseState;
  // Student actions
  toggleMealConfirmation: (mealMenuId: string, status: 'Confirmed' | 'Skipped') => void;
  updateStudentPreferences: (prefs: Partial<Pick<StudentProfile, 'dietaryPreference' | 'portionSize' | 'spicePreference' | 'remindersEnabled'>>) => void;
  claimSurplusPortions: (surplusId: string, portions: number) => { success: boolean; message: string };
  markClaimCollected: (claimId: string) => void;
  submitMealFeedback: (mealMenuId: string, rating: number, qualityComment: string, excessiveWasteObserved: boolean, wastedItemReported: string) => void;
  // Mess Manager actions
  updateMealQuantities: (mealMenuId: string, itemId: string, plannedKg: number, preparedKg: number, consumedKg: number) => void;
  addMealMenuItem: (mealMenuId: string, name: string, category: 'Main' | 'Staple' | 'Accompaniment' | 'Beverage/Dessert', plannedKg: number) => void;
  publishSurplusListing: (listing: Omit<SurplusListing, 'id' | 'createdAt' | 'remainingPortions' | 'status'>) => void;
  updateSurplusStatus: (surplusId: string, status: SurplusListing['status']) => void;
  saveDemandPrediction: (prediction: DemandPredictionRecord) => void;
  // Canteen Manager actions
  addCanteenInventoryItem: (item: Omit<CanteenInventoryItem, 'id' | 'status'>) => void;
  updateCanteenStock: (itemId: string, remainingUnits: number) => void;
  convertInventoryToSurplus: (itemId: string, portionsToPublish: number, discountedPriceInr: number, collectionDeadline: string, imageUrl?: string) => void;
  // NGO / Inspector actions
  submitFoodInspection: (inspection: Omit<FoodInspection, 'id' | 'inspectedAt'>) => void;
  recordFoodRedistribution: (record: Omit<RedistributionRecord, 'id' | 'distributedAt'>) => void;
  updateRedistributionStatus: (recordId: string, status: RedistributionRecord['collectionStatus']) => void;
  markAllNotificationsRead: () => void;
  // Aggregated live statistics
  campusMetrics: {
    totalFoodSavedKg: number;
    totalMealsRedistributed: number;
    totalWaterSavedLiters: number;
    totalCo2AvoidedKg: number;
    activeStudentsCount: number;
    currentWastagePercentage: number;
  };
}

const ReBiteContext = createContext<ReBiteContextType | undefined>(undefined);

export const ReBiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<CampusDatabaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load ReBite state from localStorage:', e);
    }
    return INITIAL_DB_STATE;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return DEMO_USERS[UserRole.STUDENT];
  });

  const [activeView, setActiveViewState] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [viewHistory, setViewHistory] = useState<('landing' | 'auth' | 'dashboard')[]>([]);

  const setActiveView = (nextView: 'landing' | 'auth' | 'dashboard') => {
    setActiveViewState((prev) => {
      if (prev !== nextView) {
        setViewHistory((h) => [...h, prev]);
      }
      return nextView;
    });
  };

  const goBack = () => {
    setViewHistory((prevHistory) => {
      if (prevHistory.length === 0) {
        setActiveViewState('landing');
        return [];
      }
      const nextHistory = [...prevHistory];
      const previousView = nextHistory.pop() || 'landing';
      setActiveViewState(previousView);
      return nextHistory;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist ReBite state:', e);
    }
  }, [db]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY}_user`);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Listen for cross-tab localStorage updates
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setDb(JSON.parse(event.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loginAsRole = (role: UserRole) => {
    const user = db.users.find((u) => u.role === role) || DEMO_USERS[role];
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const registerOrLoginCustomUser = (
    name: string,
    email: string,
    role: UserRole,
    campusUnit: string,
    verifiedId: string
  ) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      campusUnit: campusUnit.trim(),
      verifiedId: verifiedId.trim(),
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      users: [...prev.users.filter((u) => u.email !== newUser.email), newUser],
      studentProfile:
        role === UserRole.STUDENT
          ? {
              ...prev.studentProfile,
              userId: newUser.id,
              name: newUser.name,
              rollNumber: newUser.verifiedId,
              hostel: newUser.campusUnit,
            }
          : prev.studentProfile,
    }));
    setCurrentUser(newUser);
    setActiveView('dashboard');
  };

  const logout = () => {
    setActiveView('landing');
  };

  const resetDemoDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDb(INITIAL_DB_STATE);
  };

  const pushNotification = (
    targetRoles: UserRole[],
    title: string,
    message: string,
    category: AppNotification['category']
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetRoles,
      title,
      message,
      category,
      createdAt: 'Just now',
      read: false,
    };
    setDb((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  // 1. Student confirms or skips meal -> updates Mess Manager attendance + student eco metrics
  const toggleMealConfirmation = (mealMenuId: string, status: 'Confirmed' | 'Skipped') => {
    const studentId = currentUser?.id || db.studentProfile.userId;
    const studentName = currentUser?.name || db.studentProfile.name;

    setDb((prev) => {
      const existing = prev.mealConfirmations.find(
        (mc) => mc.mealMenuId === mealMenuId && mc.studentId === studentId
      );
      if (existing && existing.status === status) return prev;

      const updatedConfirmations = existing
        ? prev.mealConfirmations.map((mc) =>
            mc.id === existing.id ? { ...mc, status, updatedAt: new Date().toISOString() } : mc
          )
        : [
            ...prev.mealConfirmations,
            {
              id: `mc-${Date.now()}`,
              mealMenuId,
              studentId,
              studentName,
              status,
              portionPreference: prev.studentProfile.portionSize,
              updatedAt: new Date().toISOString(),
            },
          ];

      const updatedMenus = prev.mealMenus.map((menu) => {
        if (menu.id !== mealMenuId) return menu;
        const delta = status === 'Confirmed' ? 1 : -1;
        const newConfirmed = Math.max(0, Math.min(menu.expectedStudents, menu.confirmedCount + delta));
        return {
          ...menu,
          confirmedCount: newConfirmed,
          cancelledCount: Math.max(0, menu.expectedStudents - newConfirmed),
        };
      });

      const savedDeltaKg = 0.25; // Responsible advance confirmation prevents ~250g kitchen over-prep buffer
      const updatedProfile: StudentProfile = {
        ...prev.studentProfile,
        mealsConfirmedCount: prev.studentProfile.mealsConfirmedCount + 1,
        foodSavedKg: Number((prev.studentProfile.foodSavedKg + savedDeltaKg).toFixed(2)),
        points: prev.studentProfile.points + 15,
        sustainabilityScore: Math.min(100, prev.studentProfile.sustainabilityScore + 1),
      };

      const updatedLeaderboard = prev.leaderboard
        .map((entry) =>
          entry.id === 'usr-student-101' || entry.name === updatedProfile.name
            ? {
                ...entry,
                mealsConfirmed: updatedProfile.mealsConfirmedCount,
                foodSavedKg: updatedProfile.foodSavedKg,
                points: updatedProfile.points,
              }
            : entry
        )
        .sort((a, b) => b.points - a.points);

      const targetMeal = prev.mealMenus.find((m) => m.id === mealMenuId);

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetRoles: [UserRole.MESS_MANAGER],
        title: `Live Attendance Update · ${targetMeal?.mealType || 'Meal'}`,
        message: `${studentName} marked attendance as ${status}. Confirmed headcount updated in real time.`,
        category: 'Meal Reminder',
        createdAt: 'Just now',
        read: false,
      };

      return {
        ...prev,
        mealConfirmations: updatedConfirmations,
        mealMenus: updatedMenus,
        studentProfile: updatedProfile,
        leaderboard: updatedLeaderboard,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  };

  const updateStudentPreferences = (
    prefs: Partial<Pick<StudentProfile, 'dietaryPreference' | 'portionSize' | 'spicePreference' | 'remindersEnabled'>>
  ) => {
    setDb((prev) => ({
      ...prev,
      studentProfile: {
        ...prev.studentProfile,
        ...prefs,
      },
    }));
  };

  // 2. Student claims surplus portions -> decrements listing + creates pickup ticket + updates impact
  const claimSurplusPortions = (surplusId: string, portions: number): { success: boolean; message: string } => {
    const listing = db.surplusListings.find((s) => s.id === surplusId);
    if (!listing) {
      return { success: false, message: 'Surplus listing not found.' };
    }
    if (portions <= 0) {
      return { success: false, message: 'Please select at least 1 portion.' };
    }
    if (portions > listing.remainingPortions) {
      return {
        success: false,
        message: `Cannot claim ${portions} portions. Only ${listing.remainingPortions} portions remain.`,
      };
    }

    const weightClaimed = Number((portions * listing.weightPerPortionKg).toFixed(2));
    const pickupCode = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    const claimantId = currentUser?.id || db.studentProfile.userId;
    const claimantName = currentUser?.name || db.studentProfile.name;

    const newClaim: FoodClaim = {
      id: `claim-${Date.now()}`,
      surplusId: listing.id,
      foodName: listing.foodName,
      sourceName: listing.sourceName,
      location: listing.location,
      claimantId,
      claimantName,
      claimantRole: currentUser?.role || UserRole.STUDENT,
      portionsClaimed: portions,
      weightKg: weightClaimed,
      pickupCode,
      pickupDeadline: listing.collectionDeadline,
      status: 'Reserved',
      claimedAt: new Date().toISOString(),
    };

    setDb((prev) => {
      const updatedListings = prev.surplusListings.map((item) => {
        if (item.id !== surplusId) return item;
        const nextRemaining = item.remainingPortions - portions;
        return {
          ...item,
          remainingPortions: nextRemaining,
          status: nextRemaining === 0 ? ('Collected' as const) : ('Partially Claimed' as const),
        };
      });

      const nextFoodSavedKg = Number((prev.studentProfile.foodSavedKg + weightClaimed).toFixed(2));
      const nextClaimedCount = prev.studentProfile.mealsClaimedCount + portions;
      const nextPoints = prev.studentProfile.points + portions * 25;

      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'ach-4' && nextFoodSavedKg >= 20 && !ach.unlocked) {
          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        return ach;
      });

      const updatedProfile: StudentProfile = {
        ...prev.studentProfile,
        mealsClaimedCount: nextClaimedCount,
        foodSavedKg: nextFoodSavedKg,
        points: nextPoints,
        sustainabilityScore: Math.min(100, prev.studentProfile.sustainabilityScore + 2),
      };

      const updatedLeaderboard = prev.leaderboard
        .map((entry) =>
          entry.id === 'usr-student-101' || entry.name === updatedProfile.name
            ? {
                ...entry,
                surplusClaimed: updatedProfile.mealsClaimedCount,
                foodSavedKg: updatedProfile.foodSavedKg,
                points: updatedProfile.points,
              }
            : entry
        )
        .sort((a, b) => b.points - a.points);

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetRoles: [UserRole.MESS_MANAGER, UserRole.CANTEEN_MANAGER],
        title: `Surplus Claimed · ${portions} Portion(s) of ${listing.foodName}`,
        message: `${claimantName} reserved ${portions} portion(s) (${weightClaimed} kg) with pickup code ${pickupCode}.`,
        category: 'Surplus Alert',
        createdAt: 'Just now',
        read: false,
      };

      return {
        ...prev,
        surplusListings: updatedListings,
        foodClaims: [newClaim, ...prev.foodClaims],
        studentProfile: updatedProfile,
        leaderboard: updatedLeaderboard,
        achievements: updatedAchievements,
        notifications: [newNotif, ...prev.notifications],
      };
    });

    return {
      success: true,
      message: `Reserved ${portions} portion(s)! Show pickup code ${pickupCode} at ${listing.location}.`,
    };
  };

  const markClaimCollected = (claimId: string) => {
    setDb((prev) => ({
      ...prev,
      foodClaims: prev.foodClaims.map((c) => (c.id === claimId ? { ...c, status: 'Collected' } : c)),
    }));
  };

  const submitMealFeedback = (
    mealMenuId: string,
    rating: number,
    qualityComment: string,
    excessiveWasteObserved: boolean,
    wastedItemReported: string
  ) => {
    const meal = db.mealMenus.find((m) => m.id === mealMenuId);
    const newFb: FoodFeedback = {
      id: `fb-${Date.now()}`,
      studentId: currentUser?.id || db.studentProfile.userId,
      studentName: currentUser?.name || db.studentProfile.name,
      mealMenuId,
      mealLabel: meal ? `${meal.mealType} · ${meal.items.map((i) => i.name).join(', ')}` : 'Campus Meal',
      rating,
      qualityComment,
      excessiveWasteObserved,
      wastedItemReported: wastedItemReported || 'None',
      createdAt: new Date().toISOString(),
    };

    setDb((prev) => {
      const nextFbList = [newFb, ...prev.foodFeedback];
      const studentFbCount = nextFbList.filter((f) => f.studentId === newFb.studentId).length;
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'ach-3' && studentFbCount >= 2 && !ach.unlocked) {
          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        return ach;
      });

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetRoles: [UserRole.MESS_MANAGER],
        title: `New Student Meal Feedback (${rating}/5)`,
        message: `${newFb.studentName} reviewed ${meal?.mealType || 'Meal'}${
          excessiveWasteObserved ? ` and flagged plate waste on ${wastedItemReported}` : ''
        }.`,
        category: 'Meal Reminder',
        createdAt: 'Just now',
        read: false,
      };

      return {
        ...prev,
        foodFeedback: nextFbList,
        achievements: updatedAchievements,
        studentProfile: {
          ...prev.studentProfile,
          points: prev.studentProfile.points + 20,
        },
        notifications: [newNotif, ...prev.notifications],
      };
    });
  };

  // 3. Mess Manager actions
  const updateMealQuantities = (
    mealMenuId: string,
    itemId: string,
    plannedKg: number,
    preparedKg: number,
    consumedKg: number
  ) => {
    setDb((prev) => ({
      ...prev,
      mealMenus: prev.mealMenus.map((menu) => {
        if (menu.id !== mealMenuId) return menu;
        return {
          ...menu,
          items: menu.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  plannedKg: Math.max(0, plannedKg),
                  preparedKg: Math.max(0, preparedKg),
                  consumedKg: Math.max(0, consumedKg),
                }
              : item
          ),
        };
      }),
    }));
  };

  const addMealMenuItem = (
    mealMenuId: string,
    name: string,
    category: 'Main' | 'Staple' | 'Accompaniment' | 'Beverage/Dessert',
    plannedKg: number
  ) => {
    const newItem = {
      id: `mi-${Date.now()}`,
      name,
      category,
      plannedKg,
      preparedKg: plannedKg,
      consumedKg: 0,
    };
    setDb((prev) => ({
      ...prev,
      mealMenus: prev.mealMenus.map((menu) =>
        menu.id === mealMenuId ? { ...menu, items: [...menu.items, newItem] } : menu
      ),
    }));
  };

  const publishSurplusListing = (
    listingData: Omit<SurplusListing, 'id' | 'createdAt' | 'remainingPortions' | 'status'>
  ) => {
    const newListing: SurplusListing = {
      ...listingData,
      id: `surplus-${Date.now()}`,
      remainingPortions: listingData.totalQuantityPortions,
      status: 'Available',
      createdAt: new Date().toISOString(),
    };

    const totalKg = (listingData.totalQuantityPortions * listingData.weightPerPortionKg).toFixed(1);

    setDb((prev) => ({
      ...prev,
      surplusListings: [newListing, ...prev.surplusListings],
    }));

    pushNotification(
      [UserRole.STUDENT, UserRole.NGO_INSPECTOR],
      `New Surplus Alert · ${listingData.totalQuantityPortions} Portions (${totalKg} kg)`,
      `${listingData.sourceName} published "${listingData.foodName}" at ${listingData.location}. Pickup deadline: ${listingData.collectionDeadline}.`,
      'Surplus Alert'
    );
  };

  const updateSurplusStatus = (surplusId: string, status: SurplusListing['status']) => {
    setDb((prev) => ({
      ...prev,
      surplusListings: prev.surplusListings.map((s) => (s.id === surplusId ? { ...s, status } : s)),
    }));
  };

  const saveDemandPrediction = (prediction: DemandPredictionRecord) => {
    setDb((prev) => ({
      ...prev,
      demandPredictions: [
        prediction,
        ...prev.demandPredictions.filter((p) => p.mealMenuId !== prediction.mealMenuId),
      ],
    }));
  };

  // 4. Canteen Manager actions
  const addCanteenInventoryItem = (itemData: Omit<CanteenInventoryItem, 'id' | 'status'>) => {
    const newItem: CanteenInventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      status: itemData.remainingUnits <= itemData.totalPreparedUnits * 0.35 ? 'Approaching Expiry' : 'Fresh',
    };
    setDb((prev) => ({
      ...prev,
      canteenInventory: [newItem, ...prev.canteenInventory],
    }));
  };

  const updateCanteenStock = (itemId: string, remainingUnits: number) => {
    setDb((prev) => ({
      ...prev,
      canteenInventory: prev.canteenInventory.map((item) => {
        if (item.id !== itemId) return item;
        const clamped = Math.max(0, remainingUnits);
        return {
          ...item,
          remainingUnits: clamped,
          status:
            item.status === 'Converted to Surplus'
              ? 'Converted to Surplus'
              : clamped > 0 && clamped <= item.totalPreparedUnits * 0.35
              ? 'Approaching Expiry'
              : 'Fresh',
        };
      }),
    }));
  };

  const convertInventoryToSurplus = (
    itemId: string,
    portionsToPublish: number,
    discountedPriceInr: number,
    collectionDeadline: string,
    imageUrl?: string
  ) => {
    const invItem = db.canteenInventory.find((i) => i.id === itemId);
    if (!invItem) return;

    const actualPortions = Math.min(invItem.remainingUnits, Math.max(1, portionsToPublish));

    setDb((prev) => ({
      ...prev,
      canteenInventory: prev.canteenInventory.map((i) =>
        i.id === itemId
          ? {
              ...i,
              remainingUnits: Math.max(0, i.remainingUnits - actualPortions),
              discountedPriceInr,
              status: 'Converted to Surplus',
            }
          : i
      ),
    }));

    publishSurplusListing({
      sourceType: 'Canteen',
      sourceName: 'Gulmohar Academic Core Canteen',
      location: 'Academic Block C · Canteen Counter 2',
      foodName: invItem.name,
      description: `Batch ${invItem.batchCode} prepared at ${invItem.preparedAt}. Listed early by canteen manager to prevent end-of-day wastage.`,
      imageUrl: imageUrl || GENERATED_IMAGES.SURPLUS_CANTEEN_SNACKS,
      totalQuantityPortions: actualPortions,
      weightPerPortionKg: invItem.unitWeightKg,
      preparedAt: invItem.preparedAt,
      collectionDeadline,
      storageCondition: 'Display Cabinet (58°C)',
      storageTempCelsius: 58,
      packagingCondition: 'Biodegradable Kraft Food Box',
      priceType: discountedPriceInr === 0 ? 'Free' : 'Discounted',
      priceInr: discountedPriceInr,
      originalPriceInr: invItem.unitPriceInr,
      suitableForNgoBulk: actualPortions >= 15,
    });
  };

  // 5. NGO / Food Quality Inspector actions
  const submitFoodInspection = (inspectionData: Omit<FoodInspection, 'id' | 'inspectedAt'>) => {
    const newInspection: FoodInspection = {
      ...inspectionData,
      id: `insp-${Date.now()}`,
      inspectedAt: new Date().toISOString(),
    };

    const nextSurplusStatus: SurplusListing['status'] =
      inspectionData.decision === 'Approved for Redistribution'
        ? 'NGO Approved'
        : inspectionData.decision === 'Rejected - Composting Only'
        ? 'Expired'
        : 'Pending NGO Inspection';

    setDb((prev) => ({
      ...prev,
      foodInspections: [newInspection, ...prev.foodInspections],
      surplusListings: prev.surplusListings.map((s) =>
        s.id === inspectionData.surplusId ? { ...s, status: nextSurplusStatus } : s
      ),
    }));

    pushNotification(
      [UserRole.MESS_MANAGER, UserRole.CANTEEN_MANAGER, UserRole.NGO_INSPECTOR],
      `Food Quality Inspection: ${inspectionData.decision}`,
      `Inspector ${inspectionData.inspectorName} (${inspectionData.inspectorLicense}) logged inspection for "${inspectionData.foodName}".`,
      'NGO Inspection'
    );
  };

  const recordFoodRedistribution = (recordData: Omit<RedistributionRecord, 'id' | 'distributedAt'>) => {
    const newRecord: RedistributionRecord = {
      ...recordData,
      id: `redist-${Date.now()}`,
      distributedAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      redistributionRecords: [newRecord, ...prev.redistributionRecords],
      surplusListings: prev.surplusListings.map((s) =>
        s.id === recordData.surplusId
          ? {
              ...s,
              remainingPortions: Math.max(0, s.remainingPortions - recordData.quantityDistributedPortions),
              status: 'Collected',
            }
          : s
      ),
    }));

    pushNotification(
      [UserRole.STUDENT, UserRole.MESS_MANAGER, UserRole.CANTEEN_MANAGER, UserRole.NGO_INSPECTOR],
      `Impact Update · ${recordData.quantityDistributedPortions} Meals Distributed (${recordData.weightSavedKg} kg)`,
      `${recordData.ngoName} distributed "${recordData.foodName}" to ${recordData.beneficiariesCount} beneficiaries at ${recordData.beneficiaryCommunity}.`,
      'Distribution Impact'
    );
  };

  const updateRedistributionStatus = (recordId: string, status: RedistributionRecord['collectionStatus']) => {
    setDb((prev) => ({
      ...prev,
      redistributionRecords: prev.redistributionRecords.map((r) =>
        r.id === recordId ? { ...r, collectionStatus: status } : r
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // Compute live interconnected campus metrics from real database records
  const campusMetrics = useMemo(() => {
    const historicalSavedKg = db.historicalRecords.reduce((acc, r) => acc + r.surplusRedistributedKg, 0);
    const ngoDistributedKg = db.redistributionRecords.reduce((acc, r) => acc + r.weightSavedKg, 0);
    const studentClaimsKg = db.foodClaims.reduce((acc, c) => acc + c.weightKg, 0);

    const totalFoodSavedKg = Number((historicalSavedKg + ngoDistributedKg + studentClaimsKg).toFixed(1));
    const totalMealsRedistributed = Math.round(totalFoodSavedKg * ECO_ASSUMPTIONS.MEALS_PER_KG);
    const totalWaterSavedLiters = Math.round(totalFoodSavedKg * ECO_ASSUMPTIONS.WATER_LITERS_PER_FOOD_KG);
    const totalCo2AvoidedKg = Number((totalFoodSavedKg * ECO_ASSUMPTIONS.CO2_KG_PER_FOOD_KG).toFixed(1));

    const latestMenu = db.mealMenus.find((m) => m.id === 'meal-lunch-today') || db.mealMenus[0];
    const totalPrep = latestMenu.items.reduce((s, i) => s + i.preparedKg, 0);
    const totalConsumed = latestMenu.items.reduce((s, i) => s + i.consumedKg, 0);
    const currentWastagePercentage =
      totalPrep > 0 ? Number((((totalPrep - totalConsumed) / totalPrep) * 100).toFixed(1)) : 0;

    return {
      totalFoodSavedKg,
      totalMealsRedistributed,
      totalWaterSavedLiters,
      totalCo2AvoidedKg,
      activeStudentsCount: 1420 + db.mealConfirmations.length,
      currentWastagePercentage,
    };
  }, [db]);

  return (
    <ReBiteContext.Provider
      value={{
        currentUser,
        activeView,
        setActiveView,
        goBack,
        canGoBack: viewHistory.length > 0 || activeView !== 'landing',
        loginAsRole,
        registerOrLoginCustomUser,
        logout,
        resetDemoDatabase,
        db,
        toggleMealConfirmation,
        updateStudentPreferences,
        claimSurplusPortions,
        markClaimCollected,
        submitMealFeedback,
        updateMealQuantities,
        addMealMenuItem,
        publishSurplusListing,
        updateSurplusStatus,
        saveDemandPrediction,
        addCanteenInventoryItem,
        updateCanteenStock,
        convertInventoryToSurplus,
        submitFoodInspection,
        recordFoodRedistribution,
        updateRedistributionStatus,
        markAllNotificationsRead,
        campusMetrics,
      }}
    >
      {children}
    </ReBiteContext.Provider>
  );
};

export const useReBite = (): ReBiteContextType => {
  const context = useContext(ReBiteContext);
  if (!context) {
    throw new Error('useReBite must be used within a ReBiteProvider');
  }
  return context;
};
