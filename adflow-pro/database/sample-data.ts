// Sample data for seeding the database
export const SEED_DATA = {
  categories: [
    {
      name: 'Real Estate',
      slug: 'real-estate',
      description: 'Properties, apartments, lands, commercial spaces',
      sortOrder: 1,
    },
    {
      name: 'Jobs',
      slug: 'jobs',
      description: 'Job postings and employment opportunities',
      sortOrder: 2,
    },
    {
      name: 'Services',
      slug: 'services',
      description: 'Professional and personal services',
      sortOrder: 3,
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Business opportunities and partnerships',
      sortOrder: 4,
    },
    {
      name: 'Education',
      slug: 'education',
      description: 'Courses, training, and educational services',
      sortOrder: 5,
    },
  ],

  cities: [
    { name: 'Karachi', slug: 'karachi', country: 'Pakistan', stateProvince: 'Sindh', sortOrder: 1 },
    { name: 'Lahore', slug: 'lahore', country: 'Pakistan', stateProvince: 'Punjab', sortOrder: 2 },
    { name: 'Islamabad', slug: 'islamabad', country: 'Pakistan', stateProvince: 'Federal', sortOrder: 3 },
    { name: 'Peshawar', slug: 'peshawar', country: 'Pakistan', stateProvince: 'KPK', sortOrder: 4 },
    { name: 'Multan', slug: 'multan', country: 'Pakistan', stateProvince: 'Punjab', sortOrder: 5 },
  ],

  packages: [
    {
      name: 'Basic',
      slug: 'basic',
      description: 'Perfect for getting started',
      price: 9.99,
      durationDays: 30,
      maxAds: 1,
      featured: false,
      priorityRank: 100,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'For serious sellers',
      price: 24.99,
      durationDays: 30,
      maxAds: 3,
      featured: false,
      priorityRank: 75,
    },
    {
      name: 'Premium',
      slug: 'premium',
      description: 'Maximum exposure with featured placement',
      price: 49.99,
      durationDays: 30,
      maxAds: 5,
      featured: true,
      priorityRank: 50,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Custom solutions for high volume',
      price: 99.99,
      durationDays: 60,
      maxAds: 10,
      featured: true,
      priorityRank: 25,
    },
  ],

  sampleAds: [
    {
      title: 'Spacious 3-Bedroom Apartment in Gulshan',
      description:
        'Beautiful modern apartment with excellent views, new furniture, and premium amenities. Located in prime area with easy access to shopping, schools, and hospitals. Perfect for families.',
      category: 'Real Estate',
      city: 'Karachi',
      price: 50000,
      contact: 'ali@example.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
          type: 'image',
          title: 'Living Room',
        },
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
          type: 'image',
          title: 'Bedroom',
        },
      ],
    },
    {
      title: 'Senior Software Developer - Remote',
      description:
        'We are looking for an experienced Senior Software Developer with 5+ years of experience. Work remotely from anywhere. Competitive salary, health insurance, and flexible hours.',
      category: 'Jobs',
      city: 'Lahore',
      price: 150000,
      contact: 'hr@techcompany.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
          type: 'image',
          title: 'Office',
        },
      ],
    },
    {
      title: 'Professional Digital Marketing Services',
      description:
        'Boost your online presence with our comprehensive digital marketing services. SEO, SEM, Social Media, Content Marketing. Proven track record with 50+ successful campaigns.',
      category: 'Services',
      city: 'Islamabad',
      price: 5000,
      contact: 'services@digital.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1460925895917-adf4e69eca6d?w=600',
          type: 'image',
          title: 'Marketing Analytics',
        },
      ],
    },
    {
      title: 'Franchise Opportunity - Fitness Center Chain',
      description:
        'Invest in a growing fitness industry. We provide complete setup, training, and ongoing support. Investment range: 25-50 lakhs. ROI in 18-24 months.',
      category: 'Business',
      city: 'Multan',
      price: 2500000,
      contact: 'franchiseinfo@fitness.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
          type: 'image',
          title: 'Gym Setup',
        },
      ],
    },
    {
      title: 'Web Development Bootcamp - 12 Weeks',
      description:
        'Learn full-stack web development from scratch. Covers HTML, CSS, JavaScript, React, Node.js, MongoDB. 100% job placement guarantee. Certificate included.',
      category: 'Education',
      city: 'Karachi',
      price: 79999,
      contact: 'enrollment@bootcamp.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
          type: 'image',
          title: 'Class Room',
        },
      ],
    },
    {
      title: 'Executive Apartment in Defence, Lahore',
      description:
        '5 Marla executive apartment in Defence Society. Triple-story, modern architecture, 5 bedrooms, 4 bathrooms. Community amenities include gym, park, security.',
      category: 'Real Estate',
      city: 'Lahore',
      price: 75000000,
      contact: 'property@realestate.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
          type: 'image',
          title: 'Front View',
        },
      ],
    },
    {
      title: 'Graphic Designer - Freelance Project',
      description:
        'Looking for experienced graphic designer for logo and brand identity design. 2-week turnaround. Budget 30-50k. Must have portfolio showcasing similar work.',
      category: 'Jobs',
      city: 'Islamabad',
      price: 40000,
      contact: 'design@startup.com',
      media: [],
    },
    {
      title: 'Instagram Growth Services',
      description:
        'Real, organic followers only. Guaranteed growth in 30 days. No fake followers or bot engagement. Starting from 100-1000 followers. Check our portfolio!',
      category: 'Services',
      city: 'Karachi',
      price: 5000,
      contact: 'growth@socialmedia.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600',
          type: 'image',
          title: 'Social Media Growth',
        },
      ],
    },
    {
      title: 'E-commerce Store Launch - Business Package',
      description:
        'Complete e-commerce setup with Shopify/WooCommerce. Includes domain, hosting, product upload, payment gateway integration. Monthly maintenance included.',
      category: 'Business',
      city: 'Peshawar',
      price: 25000,
      contact: 'ecommerce@webservices.com',
      media: [],
    },
    {
      title: 'English Speaking Classes for Professionals',
      description:
        'Improve your English communication skills for workplace. Small batch classes. Experienced trainer (IELTS certified). Duration: 8 weeks, 2 hours per week.',
      category: 'Education',
      city: 'Lahore',
      price: 8000,
      contact: 'english@academy.com',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
          type: 'image',
          title: 'Class Session',
        },
      ],
    },
  ],
};

/**
 * SQL to insert sample ads (if needed)
 * Requires categories, cities, packages, and users to be created first
 */
export const SAMPLE_ADS_SQL = `
-- Insert sample ads
INSERT INTO ads (user_id, category_id, city_id, package_id, title, slug, description, 
                status, price, currency, contact_email, contact_phone, created_at, updated_at)
SELECT 
  u.id,
  c.id,
  cy.id,
  p.id,
  'Beautiful 3-Bedroom Apartment in Gulshan',
  'beautiful-3-bed-gulshan',
  'Spacious modern apartment with excellent views...',
  'published',
  50000,
  'PKR',
  'ali@example.com',
  '03001234567',
  NOW(),
  NOW()
FROM users u, categories c, cities cy, packages p
WHERE u.email = 'client@test.com' 
  AND c.slug = 'real-estate'
  AND cy.slug = 'karachi'
  AND p.slug = 'premium'
LIMIT 1;
`;
