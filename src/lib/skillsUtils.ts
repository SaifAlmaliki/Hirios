/**
 * Utility functions for parsing and normalizing skills data
 */

/**
 * Normalizes skills data from various formats into a clean array of strings
 * Handles cases where skills come as:
 * - Array of individual strings: ["React", "TypeScript", "Node.js"]
 * - Array with single semicolon-separated string: ["React; TypeScript; Node.js"]
 * - Single string with semicolons: "React; TypeScript; Node.js"
 * - Single string with commas: "React, TypeScript, Node.js"
 * - Mixed separators: "React; TypeScript, Node.js"
 * 
 * @param skills - Skills data in any format
 * @returns Array of cleaned skill strings
 */
export const normalizeSkills = (skills: string[] | string | null | undefined): string[] => {
  if (!skills) {
    return [];
  }

  // If it's already an array, process each element
  if (Array.isArray(skills)) {
    const allSkills: string[] = [];
    
    skills.forEach(skill => {
      if (typeof skill === 'string' && skill.trim()) {
        // Check if this array element contains semicolons or commas (multiple skills)
        if (skill.includes(';') || skill.includes(',')) {
          // Split this element and add all parts
          const splitSkills = skill
            .split(/[;,]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
          allSkills.push(...splitSkills);
        } else {
          // Single skill, just add it
          allSkills.push(skill.trim());
        }
      }
    });
    
    // Remove duplicates and return
    return [...new Set(allSkills)];
  }

  // If it's a string, split by common separators
  if (typeof skills === 'string') {
    return skills
      .split(/[;,]/) // Split by semicolon or comma
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  return [];
};

/**
 * Parses skills from a string that might contain multiple separators
 * @param skillsString - String containing skills with various separators
 * @returns Array of cleaned skill strings
 */
export const parseSkillsString = (skillsString: string): string[] => {
  if (!skillsString || typeof skillsString !== 'string') {
    return [];
  }

  return skillsString
    .split(/[;,]/) // Split by semicolon or comma
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
};

/**
 * Validates if a skill string is properly formatted
 * @param skill - Individual skill string
 * @returns True if skill is valid
 */
export const isValidSkill = (skill: string): boolean => {
  return skill && 
         typeof skill === 'string' && 
         skill.trim().length > 0 && 
         skill.trim().length <= 100; // Reasonable max length
};

/**
 * Cleans and validates an array of skills
 * @param skills - Array of skill strings
 * @returns Array of valid, cleaned skills
 */
export const cleanSkillsArray = (skills: string[]): string[] => {
  return skills
    .map(skill => skill.trim())
    .filter(isValidSkill)
    .filter((skill, index, array) => array.indexOf(skill) === index); // Remove duplicates
};

/**
 * Test function to verify skills normalization works correctly
 * This can be used for debugging or testing
 */
export const testSkillsNormalization = () => {
  const testCases = [
    // Case 1: Normal array format
    {
      input: ["Python", "TensorFlow", "scikit-learn", "Databricks", "SQL", "AWS", "Machine Learning", "Model Deployment"],
      expected: ["Python", "TensorFlow", "scikit-learn", "Databricks", "SQL", "AWS", "Machine Learning", "Model Deployment"]
    },
    // Case 2: Array with single semicolon-separated string
    {
      input: ["React; TypeScript; Redux; .NET Core; C#; SQL Server; MongoDB; Problem-solving"],
      expected: ["React", "TypeScript", "Redux", ".NET Core", "C#", "SQL Server", "MongoDB", "Problem-solving"]
    },
    // Case 3: Mixed array format
    {
      input: ["Python", "React; TypeScript", "AWS", "SQL Server; MongoDB"],
      expected: ["Python", "React", "TypeScript", "AWS", "SQL Server", "MongoDB"]
    },
    // Case 4: String format
    {
      input: "React; TypeScript; Node.js",
      expected: ["React", "TypeScript", "Node.js"]
    }
  ];

  console.log('🧪 Testing skills normalization...');
  testCases.forEach((testCase, index) => {
    const result = normalizeSkills(testCase.input);
    const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (!passed) {
      console.log(`  Input: ${JSON.stringify(testCase.input)}`);
      console.log(`  Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`  Got: ${JSON.stringify(result)}`);
    }
  });
};
