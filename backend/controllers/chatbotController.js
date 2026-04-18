/**
 * Chatbot Controller
 * Rule-based FAQ chatbot for student event queries
 */

const Event = require('../models/Event');

// FAQ knowledge base
const faqs = [
  { keywords: ['register', 'registration', 'sign up', 'join'], answer: 'To register for an event, go to the Events page, click on the event you want to join, and click the "Register" button. You will receive a confirmation email.' },
  { keywords: ['certificate', 'certificates'], answer: 'Certificates are issued after the event to students who attended. You can download them from your Dashboard under "My Certificates".' },
  { keywords: ['venue', 'location', 'where'], answer: 'Venue details are shown on each event page. You can also check the Venues section for a full list of available venues.' },
  { keywords: ['cancel', 'unregister', 'withdraw'], answer: 'You can cancel your registration from your Dashboard under "My Registrations" before the event date.' },
  { keywords: ['organizer', 'club', 'create event'], answer: 'Club organizers must register and get admin approval. Once approved, they can create events from their Organizer Dashboard.' },
  { keywords: ['password', 'forgot', 'reset'], answer: 'Currently, please contact the admin at the admin email for password reset assistance.' },
  { keywords: ['attendance', 'present', 'mark'], answer: 'Attendance is marked by the event organizer during or after the event. Make sure to be present at the venue.' },
  { keywords: ['invitation', 'inter-college', 'fest'], answer: 'Inter-college invitations are sent by organizers to other colleges. Check your email for invitation details.' },
  { keywords: ['event', 'events', 'upcoming'], answer: 'You can view all upcoming events on the Events page. Filter by category, date, or college to find events of interest.' },
  { keywords: ['hello', 'hi', 'hey', 'help'], answer: 'Hello! I am the College Event Management chatbot. I can help you with event registrations, certificates, venues, and more. What would you like to know?' },
  { keywords: ['google form', 'form', 'link'], answer: 'Some events have a Google Form for additional registration details. The link is available on the event details page.' },
  { keywords: ['contact', 'admin', 'support'], answer: `For support, please contact the admin at ${process.env.ADMIN_EMAIL || 'admin@college.com'}.` }
];

// Match user message to FAQ
const matchFAQ = (message) => {
  const lower = message.toLowerCase();
  for (const faq of faqs) {
    if (faq.keywords.some(kw => lower.includes(kw))) return faq.answer;
  }
  return null;
};

// @route POST /api/chatbot/message
const handleMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Try FAQ match first
    const faqAnswer = matchFAQ(message);
    if (faqAnswer) return res.json({ success: true, reply: faqAnswer, source: 'faq' });

    // Check for event-specific queries
    const lower = message.toLowerCase();
    if (lower.includes('event') || lower.includes('today') || lower.includes('tomorrow')) {
      const today = new Date();
      const events = await Event.find({ status: 'upcoming', date: { $gte: today } })
        .populate('venue', 'name').limit(3).sort({ date: 1 });
      if (events.length) {
        const list = events.map(e => `• ${e.title} on ${new Date(e.date).toDateString()} at ${e.venue?.name}`).join('\n');
        return res.json({ success: true, reply: `Here are upcoming events:\n${list}`, source: 'database' });
      }
    }

    // Default response
    res.json({
      success: true,
      reply: "I'm not sure about that. You can ask me about event registration, certificates, venues, attendance, or contact the admin for further help.",
      source: 'default'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { handleMessage };
