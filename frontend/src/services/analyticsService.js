import questionsData from '../data/questions.json';

export const analyticsService = {
  getAnxietyIndex(foundationalScore, appliedScore, collaborativeScore, reflectiveScore) {
    let index = 90;
    if (foundationalScore > 0) index -= 20;
    if (appliedScore > 0) index -= 25;
    if (collaborativeScore > 0) index -= 20;
    if (reflectiveScore > 0) index -= 15;
    return Math.max(10, index);
  },

  getTotalMasteryScore(foundationalScore, appliedScore, collaborativeScore, reflectiveScore) {
    return Math.round(foundationalScore + appliedScore + collaborativeScore + reflectiveScore);
  },

  getContextAdvice(eduContext) {
    const id = eduContext?.toLowerCase().replace(/\s+/g, '-');
    switch(id) {
      case 'south-korea':
        return { title: "South Korea Academic Focus", tagline: "High rigor, systemic diligence, and analytical excellence." };
      case 'japan':
        return { title: "Japan Precision Focus", tagline: "Holistic problem solving, collective synergy, and logical accuracy." };
      case 'denmark':
        return { title: "Denmark Collaborative Focus", tagline: "Active group projects, student autonomy, and egalitarian consensus." };
      case 'belgium':
        return { title: "Belgium Multilingual Focus", tagline: "Intercultural awareness, plurilingual synthesis, and critical reasoning." };
      case 'slovenia':
        return { title: "Slovenia Competency Focus", tagline: "Balanced knowledge synthesis, cognitive reflection, and empirical observation." };
      case 'netherlands':
        return { title: "Netherlands Inquiry Focus", tagline: "Independent problem-solving, self-directed research, and verbal negotiation." };
      case 'germany':
        return { title: "Germany Applied Focus", tagline: "Vocational coordination, structured systems logic, and dual-track learning." };
      case 'finland':
        return { title: "Finland Learner-Centered Focus", tagline: "Autonomous trust, self-reflection, and critical reasoning over metrics." };
      case 'norway':
        return { title: "Norway Equity Focus", tagline: "Inclusive teamwork, collaborative discovery, and environmental awareness." };
      case 'ireland':
        return { title: "Ireland Critical Synthesis Focus", tagline: "Expressive oral reasoning, literature synthesis, and active reflection." };
      case 'singapore':
        return { title: "Singapore SkillsFuture Focus", tagline: "Applied industrial alignment, real-world application, and math logic." };
      case 'france':
        return { title: "France Logic Focus", tagline: "Structured rationalism, cartesian logic, and philosophical debate." };
      case 'china':
        return { title: "China Analytical Focus", tagline: "Rigorous quantitative analysis, systemic discipline, and conceptual depth." };
      case 'hong-kong':
        return { title: "Hong Kong Global Focus", tagline: "Multilingual logic, international standardisation, and global integration." };
      case 'sweden':
        return { title: "Sweden Autonomy Focus", tagline: "Independent project design, peer consultation, and egalitarian critique." };
      case 'united-kingdom':
        return { title: "United Kingdom Critical Focus", tagline: "Academic debate, literature analysis, and evidence-based arguments." };
      case 'australia':
        return { title: "Australia Innovation Focus", tagline: "Creative exploration, real-world capability frameworks, and tech design." };
      case 'iceland':
        return { title: "Iceland Creative Focus", tagline: "Imaginative synthesis, local community engagement, and digital expression." };
      case 'canada':
        return { title: "Canada Innovation Focus", tagline: "Egalitarian inclusion, multicultural collaboration, and real-world synthesis." };
      case 'india':
        return { title: "India Foundation Focus", tagline: "Fundamental comprehension, mathematical logic, and scientific inquiry." };
      case 'spain':
        return { title: "Spain Reflection Focus", tagline: "Creative expression, historical context analysis, and qualitative synthesis." };
      case 'ib-model':
      case 'ib':
        return { title: "IB Mastery Focus", tagline: "Global-minded synthesis, interdisciplinary connections, and active peer-review." };
      case 'un-sdg-4':
      case 'sdg4':
        return { title: "UN SDG 4 Focus", tagline: "Equitable contribution, sustainability impact, and ethical problem solving." };
      default:
        return { title: "", tagline: "" };
    }
  },

  getRippleNodes(foundationalScore, appliedScore, collaborativeScore, reflectiveScore, history = []) {
    // Determine the current active stage index (1-based: 1, 2, 3, 4, 5, or 6 for all done)
    let currentStage = 1;

    const hasCompletedAny = history && history.length > 0;
    const hasMultipleAssessments = history && history.length >= 3;
    const hasHighPerformance = history && history.some(item => item.percentage >= 70);

    if (hasCompletedAny) {
      currentStage = 2; // Stage 1 is complete, Stage 2 is active
      
      if (hasMultipleAssessments || hasHighPerformance) {
        currentStage = 3; // Stage 2 is complete, Stage 3 is active
        
        // If foundationalScore >= 20 (out of 40), progress to workforce readiness
        if (foundationalScore >= 20) {
          currentStage = 4; // Stage 3 is complete, Stage 4 is active
          
          // If appliedScore >= 15 (out of 30) or collaborativeScore >= 10 (out of 20), progress to resilient societies
          if (appliedScore >= 15 || collaborativeScore >= 10) {
            currentStage = 5; // Stage 4 is complete, Stage 5 is active
            
            // If they have high overall mastery score, stage 5 is completed
            const totalMasteryScore = foundationalScore + appliedScore + collaborativeScore + reflectiveScore;
            if (totalMasteryScore >= 70) {
              currentStage = 6; // All stages completed!
            }
          }
        }
      }
    }

    return [
      { 
        id: 1, 
        label: "Competency Assessment", 
        description: "Evaluate knowledge and skills across subjects and Bloom’s cognitive levels.", 
        status: currentStage > 1 ? "completed" : "active"
      },
      { 
        id: 2, 
        label: "Engaged Learners", 
        description: "Learners understand their strengths and gaps and stay motivated to improve.", 
        status: currentStage > 2 ? "completed" : (currentStage === 2 ? "active" : "inactive")
      },
      { 
        id: 3, 
        label: "Skilled Graduates", 
        description: "Continuous improvement builds stronger competency and problem-solving skills.", 
        status: currentStage > 3 ? "completed" : (currentStage === 3 ? "active" : "inactive")
      },
      { 
        id: 4, 
        label: "Workforce Readiness", 
        description: "Graduates develop the skills needed for real-world challenges.", 
        status: currentStage > 4 ? "completed" : (currentStage === 4 ? "active" : "inactive")
      },
      { 
        id: 5, 
        label: "Resilient Societies", 
        description: "A skilled workforce supports innovation, growth, and stronger communities.", 
        status: currentStage > 5 ? "completed" : (currentStage === 5 ? "active" : "inactive")
      }
    ];
  }
};
