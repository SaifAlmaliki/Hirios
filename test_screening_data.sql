-- Test screening results data for Hirios dashboard
-- This will create sample data to test the AI Screening Results dashboard

-- First, let's see what jobs exist
-- SELECT id, title, company FROM jobs ORDER BY created_at DESC LIMIT 5;

-- Insert test screening results with realistic data
INSERT INTO public.screening_results (
  first_name, 
  last_name, 
  email, 
  strengths, 
  weaknesses, 
  risk_factor, 
  reward_factor, 
  overall_fit, 
  justification,
  job_id,
  notes
) VALUES 

-- Excellent candidate (>70%)
(
  'John', 
  'Smith', 
  'john.smith@example.com',
  'Strong Python and Django experience (7+ years), excellent problem-solving skills, proven track record with AWS deployment, great communication skills, has led development teams',
  'Limited experience with microservices architecture, no formal DevOps certifications',
  'May expect higher salary due to senior experience level',
  'Could become technical lead, strong mentorship potential, likely to stay long-term',
  87,
  'Excellent candidate with strong technical background. Python and Django expertise aligns perfectly with our stack. Leadership experience is a bonus for team growth.',
  (SELECT id FROM jobs ORDER BY created_at DESC LIMIT 1),
  'Top candidate - schedule technical interview immediately'
),

-- Good candidate (40-70%)
(
  'Sarah', 
  'Johnson', 
  'sarah.johnson@example.com',
  'Solid React and Node.js skills, good understanding of modern web development, enthusiastic learner, startup experience shows adaptability',
  'Only 2 years experience, limited backend knowledge, no experience with our specific tech stack',
  'Junior level may require significant training and mentorship time',
  'High growth potential, could become valuable team member with proper guidance',
  65,
  'Promising junior developer with good foundation. While experience is limited, shows strong potential and willingness to learn. Startup background indicates adaptability.',
  (SELECT id FROM jobs ORDER BY created_at DESC LIMIT 1),
  'Consider for junior position with mentorship program'
),

-- Excellent candidate (>70%)
(
  'Michael', 
  'Chen', 
  'michael.chen@techcorp.com',
  'Expert-level full-stack development, 8+ years experience, strong system design skills, experience with scalable applications, excellent code quality',
  'May be overqualified for the position, limited experience with our industry domain',
  'Might leave for better opportunities, salary expectations could be high',
  'Could significantly improve our technical architecture, potential team lead material',
  92,
  'Outstanding candidate with exceptional technical skills. Full-stack expertise and system design experience would greatly benefit our team. Slight concern about retention.',
  (SELECT id FROM jobs ORDER BY created_at DESC OFFSET 1 LIMIT 1),
  'Excellent fit - discuss career growth opportunities'
),

-- Poor candidate (<40%)
(
  'Lisa', 
  'Wilson', 
  'lisa.wilson@email.com',
  'Basic HTML/CSS knowledge, some JavaScript experience, eager to learn, good communication skills',
  'Very limited programming experience, no framework knowledge, no professional development experience, skill gap is significant',
  'Would require extensive training, may not be productive for several months, high learning curve',
  'If successful in training, could become loyal long-term employee',
  28,
  'Entry-level candidate with minimal technical experience. While enthusiasm is appreciated, the skill gap is too significant for our current needs and timeline.',
  (SELECT id FROM jobs ORDER BY created_at DESC OFFSET 1 LIMIT 1),
  'Not suitable for current opening - recommend entry-level bootcamp first'
),

-- Good candidate (40-70%)
(
  'David', 
  'Rodriguez', 
  'david.r@devcompany.com',
  'Good Python knowledge, familiar with Django, some AWS experience, reliable team player, good problem-solving approach',
  'Limited leadership experience, not familiar with modern CI/CD practices, documentation skills need improvement',
  'May need time to adapt to our development processes and tools',
  'Solid contributor potential, could grow into senior role with time',
  72,
  'Solid mid-level developer with relevant technical skills. Python and Django knowledge is good fit. Some areas need development but overall positive assessment.',
  (SELECT id FROM jobs ORDER BY created_at DESC LIMIT 1),
  'Good candidate - proceed with technical assessment'
);

-- Verify the data was inserted
SELECT 
  first_name || ' ' || last_name as candidate_name,
  email,
  overall_fit,
  CASE 
    WHEN overall_fit > 70 THEN 'Excellent'
    WHEN overall_fit >= 40 THEN 'Good' 
    ELSE 'Poor'
  END as rating,
  job_id,
  created_at
FROM screening_results 
ORDER BY created_at DESC; 