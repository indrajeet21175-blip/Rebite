export enum UserRole {
  STUDENT = 'student',
  MESS_MANAGER = 'mess_manager',
  CANTEEN_MANAGER = 'canteen_manager',
  NGO_INSPECTOR = 'ngo_inspector',
}

export const GENERATED_IMAGES = {
  HERO_CAMPUS_DINING: '/src/assets/images/hero_campus_dining_1795618641116.jpg',
  SURPLUS_PANEER_THALI: '/src/assets/images/surplus_paneer_thali_1795618646103.jpg',
  SURPLUS_VEG_BIRYANI: '/src/assets/images/surplus_veg_biryani_1795618731556.jpg',
  SURPLUS_CANTEEN_SNACKS: '/src/assets/images/surplus_canteen_snacks_1795618641947.jpg',
  NGO_FOOD_INSPECTION: '/src/assets/images/ngo_food_inspection_1795618658176.jpg',
};

// Environmental conversion constants (explicitly documented assumptions)
export const ECO_ASSUMPTIONS = {
  KG_PER_MEAL: 0.4, // 400g standard prepared Indian meal portion
  MEALS_PER_KG: 2.5,
  CO2_KG_PER_FOOD_KG: 2.5, // FAO life-cycle estimate: 2.5 kg CO2e avoided per 1 kg mixed vegetarian meal rescued
  WATER_LITERS_PER_FOOD_KG: 850, // Embedded agricultural & cooking water footprint per kg of prepared food
};

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campusUnit: string; // e.g., "Vindhya Hostel Block B", "Aravalli Central Mess", "Core Campus Canteen", "Robin Hood Army / Feeding India"
  verifiedId: string; // Roll No / Staff ID / FSSAI Inspector License
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  name: string;
  rollNumber: string;
  hostel: string;
  dietaryPreference: 'Vegetarian' | 'Jain' | 'Vegan' | 'High-Protein Veg' | 'Non-Vegetarian';
  portionSize: 'Standard' | 'Light (-25% Rice)' | 'Athlete (+25% Protein)';
  spicePreference: 'Mild' | 'Medium' | 'Spicy';
  mealsConfirmedCount: number;
  mealsClaimedCount: number;
  foodSavedKg: number;
  sustainabilityScore: number;
  points: number;
  streakDays: number;
  remindersEnabled: boolean;
}

export interface MealMenuItem {
  id: string;
  name: string;
  category: 'Main' | 'Staple' | 'Accompaniment' | 'Beverage/Dessert';
  plannedKg: number;
  preparedKg: number;
  consumedKg: number;
}

export interface MealMenu {
  id: string;
  date: string;
  dayOfWeek: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  servingWindow: string;
  cutoffTime: string;
  messName: string;
  expectedStudents: number;
  confirmedCount: number;
  cancelledCount: number;
  items: MealMenuItem[];
  status: 'Upcoming' | 'In-Service' | 'Completed';
}

export interface MealConfirmation {
  id: string;
  mealMenuId: string;
  studentId: string;
  studentName: string;
  status: 'Confirmed' | 'Skipped';
  portionPreference: string;
  updatedAt: string;
}

export interface CanteenInventoryItem {
  id: string;
  name: string;
  category: 'Fresh Bakery' | 'Hot Snacks' | 'Packaged Meals' | 'Beverages';
  batchCode: string;
  preparedAt: string;
  expiryTime: string;
  totalPreparedUnits: number;
  remainingUnits: number;
  unitWeightKg: number;
  unitPriceInr: number;
  discountedPriceInr: number;
  status: 'Fresh' | 'Approaching Expiry' | 'Converted to Surplus';
}

export interface SurplusListing {
  id: string;
  sourceType: 'Mess' | 'Canteen';
  sourceName: string;
  location: string;
  foodName: string;
  description: string;
  imageUrl: string;
  totalQuantityPortions: number;
  remainingPortions: number;
  weightPerPortionKg: number;
  preparedAt: string;
  collectionDeadline: string;
  storageCondition: string; // e.g., "Hot Holding Bain-Marie (64°C)" or "Chilled Display (4°C)"
  storageTempCelsius: number;
  packagingCondition: string;
  priceType: 'Free' | 'Discounted';
  priceInr: number;
  originalPriceInr: number;
  suitableForNgoBulk: boolean;
  status: 'Available' | 'Partially Claimed' | 'Pending NGO Inspection' | 'NGO Approved' | 'Collected' | 'Expired';
  createdAt: string;
}

export interface FoodClaim {
  id: string;
  surplusId: string;
  foodName: string;
  sourceName: string;
  location: string;
  claimantId: string;
  claimantName: string;
  claimantRole: UserRole;
  portionsClaimed: number;
  weightKg: number;
  pickupCode: string;
  pickupDeadline: string;
  status: 'Reserved' | 'Collected';
  claimedAt: string;
}

export interface FoodInspection {
  id: string;
  surplusId: string;
  foodName: string;
  sourceName: string;
  inspectorId: string;
  inspectorName: string;
  inspectorLicense: string;
  prepTime: string;
  storageTemp: string;
  storageDurationHours: number;
  packagingCondition: string;
  transportCondition: string;
  imageUrl: string;
  aiObservations: {
    visualFreshnessObservations: string[];
    possibleQualityConcerns: string[];
    missingSafetyInformation: string[];
    recommendedNextInspectionSteps: string[];
    riskLevelIndicator: string;
    mandatorySafetyDisclaimer: string;
  };
  humanVerifiedThermometer: boolean;
  humanVerifiedSensory: boolean;
  humanVerifiedPackaging: boolean;
  humanInspectorNotes: string;
  decision: 'Pending Human Check' | 'Approved for Redistribution' | 'Rejected - Composting Only';
  inspectedAt: string;
}

export interface RedistributionRecord {
  id: string;
  surplusId: string;
  inspectionId: string;
  foodName: string;
  sourceName: string;
  ngoName: string;
  inspectorName: string;
  quantityReceivedPortions: number;
  quantityDistributedPortions: number;
  weightSavedKg: number;
  beneficiaryCommunity: string;
  beneficiariesCount: number;
  collectionStatus: 'Requested' | 'In Transit' | 'Distributed';
  distributedAt: string;
}

export interface FoodFeedback {
  id: string;
  studentId: string;
  studentName: string;
  mealMenuId: string;
  mealLabel: string;
  rating: number; // 1-5
  qualityComment: string;
  excessiveWasteObserved: boolean;
  wastedItemReported: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  targetRoles: UserRole[];
  title: string;
  message: string;
  category: 'Surplus Alert' | 'Meal Reminder' | 'NGO Inspection' | 'Distribution Impact';
  createdAt: string;
  read: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  requiredAction: string;
  pointsAwarded: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DemandPredictionRecord {
  id: string;
  mealMenuId: string;
  mealLabel: string;
  date: string;
  predictedHeadcount: number;
  actualHeadcount: number | null;
  recommendedTotalKg: number;
  actualPreparedKg: number;
  actualConsumedKg: number;
  expectedSurplusKgIfUnadjusted: number;
  confidenceNote: string;
  itemRecommendations: {
    itemName: string;
    plannedKg: number;
    recommendedKg: number;
    adjustmentReason: string;
  }[];
  actionableAdvice: string[];
  generatedAt: string;
}

export interface HistoricalDailyRecord {
  date: string;
  dayShort: string;
  isWeekend: boolean;
  expectedAttendance: number;
  confirmedAttendance: number;
  actualAttendance: number;
  preparedKg: number;
  consumedKg: number;
  surplusRedistributedKg: number;
  unavoidableWasteKg: number;
  canteenUnsoldKg: number;
  costSavedInr: number;
}
