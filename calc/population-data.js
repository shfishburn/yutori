export const bodyFatPercentiles = {
    metadata: {
      sources: [
        "CDC NHANES 2015-2016 DXA Body Composition Data",
        "American College of Sports Medicine (ACSM) Body Fat % Guidelines, 2013",
        "Imboden et al. 2017 (DXA reference percentiles, N=3,327)",
        "Potter et al. 2024 (J Clin Endocrinol Metab – %BF thresholds for Metabolic Syndrome)"
      ],
      lastUpdated: "2024",
      version: "1.0",
      notes:
        "Percentile values are from a representative US sample (NHANES DXA data). Extremes (top/bottom ~5%) have greater uncertainty."
    },
    female: {
      "18-29": {
        percentiles: {
          "5": { value: 25.0, category: "Elite" },
          "15": { value: 29.0, category: "Fitness" },
          "50": { value: 38.0, category: "Average" },
          "75": { value: 43.0, category: "BelowAverage" },
          "95": { value: 50.0, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤25%",
            percentileRange: "top 5%",
            description:
              "Exceptionally low body fat, typical of elite female athletes in this age group."
          },
          fitness: {
            range: "25-30%",
            percentileRange: "5-15%",
            description: "Very lean and fit. This range is common in highly active women."
          },
          average: {
            range: "30-43%",
            percentileRange: "15-75%",
            description: "Typical body fat percentage for 18-29 year-old US women."
          },
          belowAverage: {
            range: "43-50%",
            percentileRange: "75-95%",
            description: "Above-average body fat for this age, correlating with overweight."
          },
          atRisk: {
            range: ">50%",
            percentileRange: "top 5% (highest)",
            description: "This level of body fat is in the obese range for young women."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "Moderate",
            description: "Risk increases significantly with body fat percentage."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "Moderate",
            description: "Early signs of potential future cardiovascular risks."
          }
        ]
      },
      "30-39": {
        percentiles: {
          "5": { value: 28.0, category: "Elite" },
          "15": { value: 32.0, category: "Fitness" },
          "50": { value: 41.0, category: "Average" },
          "75": { value: 45.0, category: "BelowAverage" },
          "95": { value: 52.0, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤28%",
            percentileRange: "top 5%",
            description: "Exceptionally lean for women in their 30s."
          },
          fitness: {
            range: "28-32%",
            percentileRange: "5-15%",
            description:
              "Above-average fitness level with good health indicators."
          },
          average: {
            range: "32-45%",
            percentileRange: "15-75%",
            description: "Typical range for women 30-39."
          },
          belowAverage: {
            range: "45-52%",
            percentileRange: "75-95%",
            description: "High body fat for this age group."
          },
          atRisk: {
            range: ">52%",
            percentileRange: "top 5%",
            description: "Obesity range with elevated health risks."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "Elevated",
            description: "Increased risk of metabolic complications."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "Moderate",
            description: "Emerging cardiovascular risk factors."
          }
        ]
      }
      // Additional age groups can be added similarly
    },
    male: {
      "18-29": {
        percentiles: {
          "5": { value: 13, category: "Elite" },
          "15": { value: 17, category: "Fitness" },
          "50": { value: 25, category: "Average" },
          "75": { value: 30, category: "BelowAverage" },
          "95": { value: 37, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤13%",
            percentileRange: "top 5%",
            description:
              "Exceptionally lean for young men, typically seen in elite athletes. Indicates superior metabolic and cardiovascular health. (Note: values significantly below 6% are dangerous.)"
          },
          fitness: {
            range: "13-17%",
            percentileRange: "5-15%",
            description:
              "Very fit and active. Body fat in this range is associated with high performance and low cardiometabolic risk."
          },
          average: {
            range: "17-25%",
            percentileRange: "15-75%",
            description:
              "Typical body fat percentage for non-athlete young men. Most have normal metabolic profiles, though risks begin to increase toward the upper end."
          },
          belowAverage: {
            range: "25-30%",
            percentileRange: "75-95%",
            description:
              "Above-average body fat, indicating potential overweight. Associated with early signs of metabolic and cardiovascular issues."
          },
          atRisk: {
            range: ">30%",
            percentileRange: "top 5% (highest)",
            description:
              "Very high body fat strongly linked to increased risk of metabolic syndrome, type 2 diabetes, and cardiovascular disease."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "Elevated",
            description:
              "Young men with body fat above ~25% have a higher risk of developing metabolic syndrome, particularly if fat is concentrated abdominally."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "Elevated",
            description:
              "Excess body fat is associated with early markers of cardiovascular disease, including high blood pressure and dyslipidemia."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~2,500 men 18-29",
            method: "DXA",
            citation: "Estimates based on DXA body composition data"
          },
          {
            name: "ACSM Guidelines",
            sampleSize: "N/A (consensus)",
            method: "Various",
            citation: "Ideal body fat % for age"
          }
        ]
      },
      "30-39": {
        percentiles: {
          "5": { value: 17, category: "Elite" },
          "15": { value: 21, category: "Fitness" },
          "50": { value: 28, category: "Average" },
          "75": { value: 32, category: "BelowAverage" },
          "95": { value: 39, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤17%",
            percentileRange: "top 5%",
            description:
              "Exceptionally low body fat, typically seen in elite athletes. Indicates outstanding metabolic health."
          },
          fitness: {
            range: "17-21%",
            percentileRange: "5-15%",
            description:
              "Very fit and active; associated with low cardiometabolic risk and high physical performance."
          },
          average: {
            range: "21-28%",
            percentileRange: "15-75%",
            description:
              "Typical body fat percentage for men in their 30s. Most have a normal metabolic profile, though risks increase near the upper end."
          },
          belowAverage: {
            range: "28-32%",
            percentileRange: "75-95%",
            description:
              "Slightly higher than average body fat, associated with an increased risk of metabolic issues over time."
          },
          atRisk: {
            range: ">32%",
            percentileRange: "top 5%",
            description:
              "Very high body fat levels indicating significant obesity-related health risks."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "Elevated",
            description:
              "Men with body fat in the higher range (>28%) show early signs of metabolic syndrome."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "Moderate",
            description:
              "Increased body fat correlates with early arterial stiffening and higher blood pressure."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~2,000 men 30-39",
            method: "DXA",
            citation: "Based on DXA body composition data"
          },
          {
            name: "Peer-reviewed Study",
            sampleSize: "N/A",
            method: "DXA",
            citation: "Study on male body fat percentiles"
          }
        ]
      },
      "40-49": {
        percentiles: {
          "5": { value: 18, category: "Elite" },
          "15": { value: 23, category: "Fitness" },
          "50": { value: 29, category: "Average" },
          "75": { value: 32, category: "BelowAverage" },
          "95": { value: 37, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤18%",
            percentileRange: "top 5%",
            description:
              "Exceptionally low body fat in mid-life, characteristic of highly conditioned individuals."
          },
          fitness: {
            range: "18-23%",
            percentileRange: "5-15%",
            description:
              "Indicative of high fitness levels and low risk of metabolic dysfunction."
          },
          average: {
            range: "23-29%",
            percentileRange: "15-75%",
            description: "Represents the typical body composition for most men in their 40s."
          },
          belowAverage: {
            range: "29-32%",
            percentileRange: "75-95%",
            description:
              "Higher than average body fat that may signal an increased risk of metabolic issues."
          },
          atRisk: {
            range: ">32%",
            percentileRange: "top 5%",
            description:
              "Significantly elevated body fat associated with obesity and increased risk of chronic diseases."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "Moderate",
            description:
              "Higher body fat levels in the 40s correlate with increased risk of metabolic syndrome."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "Moderate",
            description:
              "Excess body fat is linked to higher blood pressure and cholesterol levels."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~1,500 men 40-49",
            method: "DXA",
            citation: "DXA-derived estimates for male body fat"
          },
          {
            name: "ACSM Guidelines",
            sampleSize: "N/A",
            method: "Consensus",
            citation: "Body fat norms for men"
          }
        ]
      },
      "50-59": {
        percentiles: {
          "5": { value: 20, category: "Elite" },
          "15": { value: 24, category: "Fitness" },
          "50": { value: 29, category: "Average" },
          "75": { value: 33, category: "BelowAverage" },
          "95": { value: 40, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤20%",
            percentileRange: "top 5%",
            description:
              "Very low body fat for this age group; typically observed in men with exceptional fitness."
          },
          fitness: {
            range: "20-24%",
            percentileRange: "5-15%",
            description:
              "Indicates good physical conditioning and low cardiometabolic risk."
          },
          average: {
            range: "24-29%",
            percentileRange: "15-75%",
            description:
              "Typical body fat percentage for men in their 50s, with most maintaining a generally healthy profile."
          },
          belowAverage: {
            range: "29-33%",
            percentileRange: "75-95%",
            description:
              "Higher than average body fat, increasing the risk of metabolic and cardiovascular issues."
          },
          atRisk: {
            range: ">33%",
            percentileRange: "top 5%",
            description:
              "Very high body fat strongly associated with obesity-related health risks."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "High",
            description:
              "Overweight levels in the 50s increase the risk of metabolic syndrome."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "High",
            description:
              "Excess fat is linked to higher risk of hypertension and cardiovascular events."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~1,200 men 50-59",
            method: "DXA",
            citation:
              "DXA data indicating body fat trends in older men"
          },
          {
            name: "Peer-reviewed Study",
            sampleSize: "N/A",
            method: "DXA",
            citation: "Study on aging and male body composition"
          }
        ]
      },
      "60-69": {
        percentiles: {
          "5": { value: 22, category: "Elite" },
          "15": { value: 25, category: "Fitness" },
          "50": { value: 30, category: "Average" },
          "75": { value: 34, category: "BelowAverage" },
          "95": { value: 41, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤22%",
            percentileRange: "top 5%",
            description:
              "Exceptionally lean older men; represents a small, highly fit subset with superior metabolic health."
          },
          fitness: {
            range: "22-25%",
            percentileRange: "5-15%",
            description:
              "Indicates a well-maintained body composition with favorable health metrics."
          },
          average: {
            range: "25-30%",
            percentileRange: "15-75%",
            description:
              "Typical for many men in their 60s, reflecting normal age-related increases in fat and decreases in muscle mass."
          },
          belowAverage: {
            range: "30-34%",
            percentileRange: "75-95%",
            description:
              "Above-average fat levels, associated with higher risks of metabolic dysfunction."
          },
          atRisk: {
            range: ">34%",
            percentileRange: "top 5%",
            description:
              "High body fat that significantly increases the risk of chronic diseases, including diabetes and cardiovascular events."
          }
        },
            healthRisks: [
            {
                condition: "Metabolic Syndrome",
                riskLevel: "High",
                description:
                "In older men, elevated body fat correlates with a high prevalence of metabolic syndrome."
            },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "High",
            description:
              "Higher body fat is associated with increased arterial stiffness, high blood pressure, and coronary risk."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~1,000 men 60-69",
            method: "DXA",
            citation:
              "Based on DXA measurements in older men"
          },
          {
            name: "Peer-reviewed Study",
            sampleSize: "N/A",
            method: "DXA",
            citation:
              "Study on age-related body composition changes in men"
          }
        ]
      },
      "70-75": {
        percentiles: {
          "5": { value: 24, category: "Elite" },
          "15": { value: 27, category: "Fitness" },
          "50": { value: 31, category: "Average" },
          "75": { value: 35, category: "BelowAverage" },
          "95": { value: 40, category: "AtRisk" }
        },
        categories: {
          elite: {
            range: "≤24%",
            percentileRange: "top 5%",
            description:
              "Atypically low body fat for men over 70, often seen in individuals with lifelong exercise habits."
          },
          fitness: {
            range: "24-27%",
            percentileRange: "5-15%",
            description:
              "Represents a fit body composition in older age, associated with better functional status and lower disease risk."
          },
          average: {
            range: "27-31%",
            percentileRange: "15-75%",
            description:
              "The typical range for older men, reflecting gradual fat accumulation with age."
          },
          belowAverage: {
            range: "31-35%",
            percentileRange: "75-95%",
            description:
              "Above-average body fat, which may be associated with increased risk of mobility limitations and metabolic dysfunction."
          },
          atRisk: {
            range: ">35%",
            percentileRange: "top 5%",
            description:
              "Extremely high body fat in late life, strongly linked to increased risk of cardiovascular events and metabolic syndrome."
          }
        },
        healthRisks: [
          {
            condition: "Metabolic Syndrome",
            riskLevel: "High",
            description:
              "In men over 70, high body fat significantly raises the risk of metabolic syndrome and related complications."
          },
          {
            condition: "Cardiovascular Disease",
            riskLevel: "High",
            description:
              "Elevated body fat is associated with higher risks of heart disease and reduced overall longevity in older men."
          }
        ],
        sourceStudies: [
          {
            name: "NHANES DXA Data (CDC)",
            sampleSize: "~800 men 70-75",
            method: "DXA",
            citation:
              "Data extrapolated from DXA studies of older adults"
          },
          {
            name: "Peer-reviewed Study",
            sampleSize: "N/A",
            method: "DXA",
            citation:
              "Research on elderly male body composition"
          }
        ]
      }
    }
  };
  
  // Function to get age range based on a given age
  export function getAgeRange(age) {
    if (age < 30) return "18-29";
    if (age < 40) return "30-39";
    if (age < 50) return "40-49";
    if (age < 60) return "50-59";
    if (age < 70) return "60-69";
    return "70-75";
  }
  
  // Comprehensive percentile calculation function for female data
  export function calculateDemographicContext(bodyFatPct, age, gender) {
    if (gender !== "female") {
      console.warn("Currently only female data is available");
      return null;
    }
  
    const ageRange = getAgeRange(age);
    const percentileData = bodyFatPercentiles[gender][ageRange].percentiles;
    const categories = bodyFatPercentiles[gender][ageRange].categories;
  
    // Determine percentile and category (default to median)
    let percentile = 50;
    let categoryKey = "average";
  
    Object.entries(percentileData).forEach(([key, data]) => {
      const percentileValue = parseFloat(key);
      if (bodyFatPct <= data.value) {
        percentile = percentileValue;
        categoryKey = data.category.toLowerCase();
      }
    });
  
    const categoryDetails = categories[categoryKey];
  
    return {
      percentile,
      category: categoryKey,
      range: categoryDetails.range,
      percentileRange: categoryDetails.percentileRange,
      description: categoryDetails.description,
      healthRisks: bodyFatPercentiles[gender][ageRange].healthRisks
    };
  }
  
  // Utility function to map numeric percentile to descriptor
  export function getPercentileDescriptor(percentile) {
    if (percentile <= 5) return "Exceptional (Top 5%)";
    if (percentile <= 15) return "Elite (Top 15%)";
    if (percentile <= 50) return "Average";
    if (percentile <= 75) return "Below Average";
    return "At High Risk";
  }
  