/**
 * ============================================================
 * College Event Management System - MongoDB Schema Reference
 * ============================================================
 * Database: college_events (MongoDB)
 * ORM: Mongoose
 * ============================================================
 */

// ============================================================
// COLLECTION: users
// ============================================================
{
  _id: ObjectId,
  name: String,           // Required
  email: String,          // Required, Unique, Lowercase
  password: String,       // Bcrypt hashed
  role: String,           // Enum: ['admin', 'organizer', 'student']

  // Organizer-specific
  collegeName: String,
  clubName: String,
  phone: String,
  status: String,         // Enum: ['pending', 'approved', 'rejected'] - Default: 'approved'

  // Student-specific
  isVerified: Boolean,    // Default: false
  verificationToken: String,

  profileImage: String,
  createdAt: Date
}

// ============================================================
// COLLECTION: colleges
// ============================================================
{
  _id: ObjectId,
  name: String,           // Required, Unique
  location: String,
  email: String,
  phone: String,
  website: String,
  isActive: Boolean,      // Default: true
  createdAt: Date
}

// ============================================================
// COLLECTION: venues
// ============================================================
{
  _id: ObjectId,
  name: String,           // Required
  capacity: Number,       // Required
  location: String,       // Required
  college: String,        // Required - College name
  description: String,
  facilities: [String],   // Array of facility names
  image: String,          // File path
  status: String,         // Enum: ['available', 'maintenance', 'inactive']
  createdBy: ObjectId,    // Ref: User (admin)
  createdAt: Date
}

// ============================================================
// COLLECTION: events
// ============================================================
{
  _id: ObjectId,
  title: String,          // Required
  description: String,    // Required
  category: String,       // Enum: ['technical','cultural','sports','academic','workshop','seminar','fest','other']
  venue: ObjectId,        // Ref: Venue, Required
  organizer: ObjectId,    // Ref: User (organizer), Required
  date: Date,             // Required
  startTime: String,      // "HH:MM" format, Required
  endTime: String,        // "HH:MM" format, Required
  maxParticipants: Number,// Required
  googleFormLink: String,
  banner: String,         // File path
  status: String,         // Enum: ['upcoming','ongoing','completed','cancelled']
  isInterCollege: Boolean,// Default: false
  seatingLayout: String,  // JSON string
  registeredCount: Number,// Default: 0
  createdAt: Date
}

// ============================================================
// COLLECTION: registrations
// ============================================================
{
  _id: ObjectId,
  event: ObjectId,        // Ref: Event, Required
  student: ObjectId,      // Ref: User (student), Required
  status: String,         // Enum: ['registered','attended','absent','cancelled']
  attended: Boolean,      // Default: false
  registeredAt: Date,
  attendedAt: Date
}
// Unique Index: { event: 1, student: 1 }

// ============================================================
// COLLECTION: invitations
// ============================================================
{
  _id: ObjectId,
  event: ObjectId,        // Ref: Event, Required
  sentBy: ObjectId,       // Ref: User (organizer), Required
  fromCollege: String,    // Required
  toCollege: String,      // Required
  toEmail: String,        // Required
  message: String,
  status: String,         // Enum: ['sent','accepted','declined','pending']
  sentAt: Date,
  respondedAt: Date
}

// ============================================================
// COLLECTION: certificates
// ============================================================
{
  _id: ObjectId,
  certificateId: String,  // UUID, Unique
  student: ObjectId,      // Ref: User (student), Required
  event: ObjectId,        // Ref: Event, Required
  issuedBy: ObjectId,     // Ref: User (organizer), Required
  filePath: String,       // PDF file path
  issuedAt: Date
}

// ============================================================
// COLLECTION: notifications
// ============================================================
{
  _id: ObjectId,
  user: ObjectId,         // Ref: User, Required
  title: String,          // Required
  message: String,        // Required
  type: String,           // Enum: ['info','success','warning','error']
  isRead: Boolean,        // Default: false
  createdAt: Date
}

/**
 * KEY RELATIONSHIPS:
 * - User (organizer) creates Events
 * - Event belongs to Venue
 * - User (student) registers for Events via Registration
 * - Organizer sends Invitations to other colleges
 * - Organizer generates Certificates for attended Students
 * - Admin approves/rejects Organizers
 * - Admin manages Venues and Colleges
 *
 * CLASH DETECTION LOGIC:
 * When creating an event, the system checks:
 *   Event.find({
 *     venue: venueId,
 *     date: eventDate,
 *     status: { $ne: 'cancelled' },
 *     $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
 *   })
 * If any result found => CLASH DETECTED => Event creation blocked
 */
