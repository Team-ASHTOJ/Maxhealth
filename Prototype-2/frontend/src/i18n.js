import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "appTitle": "Aerosense",
      "darkMode": "Dark Mode",
      "language": "Language",
      
      // Controls
      "selectSite": "Select Site",
      "selectPollutant": "Select Pollutant",
      "forecastHorizon": "Forecast Horizon",
      "next24h": "Next 24 hours",
      "next48h": "Next 48 hours",
      "next7d": "Next 7 days",
      
      // Dashboard sections
      "liveAQI": "Live AQI",
      "modelPerformance": "Model Performance Score",
      "forecastGraph": "Forecast Graph",
      "heatmap": "Forecast Heatmap",
      "healthRecommendations": "Health Recommendations",
      "communityFeedback": "Community Feedback",
      
      // AQI Categories
      "good": "Good",
      "moderate": "Moderate",
      "unhealthySensitive": "Unhealthy for Sensitive Groups",
      "unhealthy": "Unhealthy",
      "veryUnhealthy": "Very Unhealthy",
      "hazardous": "Hazardous",
      "aqi_level_good": "Good",
      "aqi_level_moderate": "Moderate",
      "aqi_level_unhealthy_sensitive": "Unhealthy for Sensitive Groups",
      "aqi_level_unhealthy": "Unhealthy",
      "aqi_level_very_unhealthy": "Very Unhealthy",
      "aqi_level_hazardous": "Hazardous",
      
      // Actions
      "download": "Download Forecast Data",
      "submitFeedback": "Submit Feedback",
      "viewBreakdown": "View Score Breakdown",
      
      // Feedback
      "howAirFeels": "How does the air feel?",
      "fresh": "Fresh",
      "smoky": "Smoky",
      "dusty": "Dusty",
      "normal": "Normal",
      "addComment": "Add a comment (optional)",
      "submit": "Submit",
      
      // Health Profile
      "yourProfile": "Your Profile",
      "ageGroup": "Age Group",
      "child": "Child",
      "adult": "Adult",
      "elderly": "Elderly",
      "conditions": "Health Conditions",
      "asthma": "Asthma",
      "heartDisease": "Heart Disease",
      "respiratory": "Respiratory Issues",
      
      // Metrics
      "accuracy": "Accuracy",
      "rmse": "RMSE",
      "r2": "R²",
      "ria": "RIA",
      "mae": "MAE",
      "bias": "Bias",
      
      // Messages
      "loading": "Loading...",
      "noData": "No data available",
      "error": "Error loading data",
      "feedbackSuccess": "Thank you for your feedback!",

      // Live AQI Card
      "delhiIndia": "Delhi, India",
      "aqi_desc_good": "Air quality is satisfactory",
      "aqi_desc_moderate": "Air quality is acceptable",
      "aqi_desc_unhealthy_sensitive": "Sensitive groups may experience health effects",
      "aqi_desc_unhealthy": "Everyone may begin to experience health effects",
      "aqi_desc_very_unhealthy": "Health alert: everyone may experience serious health effects",
      "aqi_desc_hazardous": "Health warning of emergency conditions",

      // Metrics Card
      "overallScore": "Overall model performance score",

      // Health Recommendations
      "activityLevel": "Recommended Activity Level",
      "outdoorGuidance": "Outdoor Activity Guidance",
      "healthTips": "Health Tips",
      "potentialRisks": "Potential Health Risks",
      "rec_activity_full": "Full outdoor activities recommended",
      "rec_outdoor_perfect": "Perfect day for jogging, cycling, and outdoor sports!",
      "rec_activity_light": "Light to moderate activities",
      "rec_outdoor_reduce": "Consider reducing prolonged outdoor exertion",
      "rec_activity_normal": "Normal outdoor activities",
      "rec_outdoor_safe": "Safe for most outdoor activities",
      "rec_activity_reduce": "Reduce outdoor activities",
      "rec_outdoor_avoid_prolonged": "Avoid prolonged outdoor exertion",
      "rec_activity_moderate": "Moderate outdoor activities acceptable",
      "rec_outdoor_reduce_intense": "Consider reducing intense outdoor activities",
      "rec_activity_avoid": "Avoid outdoor activities",
      "rec_outdoor_everyone_avoid": "Everyone should avoid prolonged outdoor exertion",
      "rec_activity_stay_indoors": "Stay indoors",
      "rec_outdoor_avoid_all": "Avoid all outdoor activities",
      "rec_activity_emergency": "Remain indoors - health emergency",
      "rec_outdoor_no_go": "Do not go outside unless absolutely necessary",
      "rec_tip_enjoy_fresh_air": "Enjoy the fresh air!",
      "rec_risk_no_specific": "No specific health risks for the general population.",
      "rec_risk_sensitive_symptoms": "Unusually sensitive people may experience minor respiratory symptoms.",
      "rec_tip_take_breaks": "Take breaks during outdoor activities",
      "rec_tip_aqi_acceptable": "Air quality is acceptable",
      "rec_risk_sensitive_respiratory": "Increased likelihood of respiratory symptoms in sensitive individuals.",
      "rec_risk_sensitive_aggravation": "Aggravation of heart or lung disease and premature mortality in persons with cardiopulmonary disease and the elderly.",
      "rec_tip_stay_indoors_possible": "Stay indoors if possible",
      "rec_tip_use_purifiers": "Use air purifiers at home",
      "rec_tip_monitor_symptoms": "Monitor for symptoms like coughing",
      "rec_risk_aggravation": "Increased aggravation of heart or lung disease.",
      "rec_risk_widespread_respiratory": "Widespread respiratory effects in the general population.",
      "rec_tip_stay_indoors_filtered": "Stay indoors with filtered air",
      "rec_tip_wear_n95": "Wear N95 masks if you must go outside",
      "rec_risk_sig_aggravation": "Significant aggravation of heart or lung disease.",
      "rec_risk_increased_respiratory": "Increased respiratory effects in general population.",
      "rec_risk_serious_mortality": "Serious risk of premature mortality in persons with cardiopulmonary disease and the elderly.",
      "rec_tip_emergency_indoors": "Emergency: Stay indoors with air purification",
      "rec_tip_wear_n99": "Wear N95/N99 masks if outdoor exposure is unavoidable",
      "rec_risk_serious_respiratory": "Serious risk of respiratory effects in general population.",
      "rec_risk_hazardous_all": "Hazardous for all individuals, especially those with existing conditions.",
      "rec_tip_health_alert": "HEALTH ALERT: Hazardous air quality",
      "rec_tip_clean_room": "Create a clean room with air purifiers",
      "rec_tip_follow_advisories": "Follow official health advisories",
      "sensitiveIndividuals": "Unusually sensitive people may experience minor respiratory symptoms.",
      "reduceOutdoorActivity": "Reduce prolonged or heavy outdoor exertion.",
      "sensitiveGroupsReduce": "Sensitive groups should reduce outdoor activity.",
      "everyoneRisk": "Everyone may begin to experience health effects.",
      "avoidOutdoorActivity": "Avoid all outdoor exertion.",
      "avoidoutdooractivities": "Avoid outdoor activities",
      "stayindoorswithfilteredair": "Stay indoors with filtered air",
      "wearn95masksifyoumustgooutside": "Wear N95 masks if you must go outside",
      "everyoneshouldavoidprolongedoutdoorexertion": "Everyone should avoid prolonged outdoor exertion",
      "sensitiveGroupsAvoid": "Sensitive groups should avoid all outdoor activity.",
      "healthAlert": "Health alert: everyone may experience more serious health effects.",
      "stayIndoors": "Everyone should avoid all outdoor exertion.",
      "remainIndoors": "Remain indoors and keep activity levels low.",
      "seriousRisk": "Health warnings of emergency conditions. The entire population is more likely to be affected.",
      "addToPlanner": "Add to Planner",
      "ozone": "Ozone",
      "nitrogen_dioxide": "Nitrogen Dioxide",
    }
  },
  hi: {
    translation: {
      // Navigation
      "appTitle": "एयरोसेंस",
      "darkMode": "डार्क मोड",
      "language": "भाषा",
      
      // Controls
      "selectSite": "साइट चुनें",
      "selectPollutant": "प्रदूषक चुनें",
      "forecastHorizon": "पूर्वानुमान अवधि",
      "next24h": "अगले 24 घंटे",
      "next48h": "अगले 48 घंटे",
      "next7d": "अगले 7 दिन",
      
      // Dashboard sections
      "liveAQI": "लाइव AQI",
      "modelPerformance": "मॉडल प्रदर्शन स्कोर",
      "forecastGraph": "पूर्वानुमान ग्राफ",
      "heatmap": "पूर्वानुमान हीटमैप",
      "healthRecommendations": "स्वास्थ्य सिफारिशें",
      "communityFeedback": "सामुदायिक प्रतिक्रिया",
      
      // AQI Categories
      "good": "अच्छा",
      "moderate": "मध्यम",
      "unhealthySensitive": "संवेदनशील समूहों के लिए अस्वस्थ",
      "unhealthy": "अस्वस्थ",
      "veryUnhealthy": "बहुत अस्वस्थ",
      "hazardous": "खतरनाक",
      "aqi_level_good": "अच्छा",
      "aqi_level_moderate": "मध्यम",
      "aqi_level_unhealthy_sensitive": "संवेदनशील समूहों के लिए अस्वस्थ",
      "aqi_level_unhealthy": "अस्वस्थ",
      "aqi_level_very_unhealthy": "बहुत अस्वस्थ",
      "aqi_level_hazardous": "खतरनाक",
      
      // Actions
      "download": "पूर्वानुमान डेटा डाउनलोड करें",
      "submitFeedback": "प्रतिक्रिया सबमिट करें",
      "viewBreakdown": "स्कोर विवरण देखें",
      
      // Feedback
      "howAirFeels": "हवा कैसी लगती है?",
      "fresh": "ताजा",
      "smoky": "धुंआयुक्त",
      "dusty": "धूल भरी",
      "normal": "सामान्य",
      "addComment": "टिप्पणी जोड़ें (वैकल्पिक)",
      "submit": "सबमिट करें",
      
      // Health Profile
      "yourProfile": "आपकी प्रोफ़ाइल",
      "ageGroup": "आयु वर्ग",
      "child": "बच्चा",
      "adult": "वयस्क",
      "elderly": "बुजुर्ग",
      "conditions": "स्वास्थ्य स्थितियां",
      "asthma": "दमा",
      "heartDisease": "हृदय रोग",
      "respiratory": "श्वसन समस्याएं",
      
      // Metrics
      "accuracy": "सटीकता",
      "rmse": "RMSE",
      "r2": "R²",
      "ria": "RIA",
      "mae": "MAE",
      "bias": "पूर्वाग्रह",
      
      // Messages
      "loading": "लोड हो रहा है...",
      "noData": "कोई डेटा उपलब्ध नहीं",
      "error": "डेटा लोड करने में त्रुटि",
      "feedbackSuccess": "आपकी प्रतिक्रिया के लिए धन्यवाद!",

      // Live AQI Card
      "delhiIndia": "दिल्ली, भारत",
      "aqi_desc_good": "वायु गुणवत्ता संतोषजनक है",
      "aqi_desc_moderate": "वायु गुणवत्ता स्वीकार्य है",
      "aqi_desc_unhealthy_sensitive": "संवेदनशील समूहों को स्वास्थ्य पर प्रभाव पड़ सकता है",
      "aqi_desc_unhealthy": "सभी को स्वास्थ्य पर प्रभाव का अनुभव होना शुरू हो सकता है",
      "aqi_desc_very_unhealthy": "स्वास्थ्य चेतावनी: सभी को अधिक गंभीर स्वास्थ्य प्रभाव का अनुभव हो सकता है",
      "aqi_desc_hazardous": "आपातकालीन स्थितियों की स्वास्थ्य चेतावनी",

      // Metrics Card
      "overallScore": "समग्र मॉडल प्रदर्शन स्कोर",

      // Health Recommendations
      "activityLevel": "अनुशंसित गतिविधि स्तर",
      "outdoorGuidance": "बाहरी गतिविधि मार्गदर्शन",
      "healthTips": "स्वास्थ्य युक्तियाँ",
      "potentialRisks": "संभावित स्वास्थ्य जोखिम",
      "rec_activity_full": "पूर्ण बाहरी गतिविधियों की सिफारिश की जाती है",
      "rec_outdoor_perfect": "जॉगिंग, साइकिलिंग और आउटडोर खेलों के लिए बिल्कुल सही दिन!",
      "rec_activity_light": "हल्की से मध्यम गतिविधियाँ",
      "rec_outdoor_reduce": "लंबे समय तक बाहरी परिश्रम कम करने पर विचार करें",
      "rec_activity_normal": "सामान्य बाहरी गतिविधियाँ",
      "rec_outdoor_safe": "अधिकांश बाहरी गतिविधियों के लिए सुरक्षित",
      "rec_activity_reduce": "बाहरी गतिविधियाँ कम करें",
      "rec_outdoor_avoid_prolonged": "लंबे समय तक बाहरी परिश्रम से बचें",
      "rec_activity_moderate": "मध्यम बाहरी गतिविधियाँ स्वीकार्य हैं",
      "rec_outdoor_reduce_intense": "तीव्र बाहरी गतिविधियों को कम करने पर विचार करें",
      "rec_activity_avoid": "बाहरी गतिविधियों से बचें",
      "rec_outdoor_everyone_avoid": "सभी को लंबे समय तक बाहरी परिश्रम से बचना चाहिए",
      "rec_activity_stay_indoors": "घर के अंदर रहें",
      "rec_outdoor_avoid_all": "सभी बाहरी गतिविधियों से बचें",
      "rec_activity_emergency": "घर के अंदर रहें - स्वास्थ्य आपातकाल",
      "rec_outdoor_no_go": "जब तक बिल्कुल आवश्यक न हो बाहर न जाएं",
      "rec_tip_enjoy_fresh_air": "ताजी हवा का आनंद लें!",
      "rec_risk_no_specific": "सामान्य आबादी के लिए कोई विशेष स्वास्थ्य जोखिम नहीं।",
      "rec_risk_sensitive_symptoms": "असामान्य रूप से संवेदनशील लोगों को मामूली श्वसन लक्षण अनुभव हो सकते हैं।",
      "rec_tip_take_breaks": "बाहरी गतिविधियों के दौरान ब्रेक लें",
      "rec_tip_aqi_acceptable": "वायु गुणवत्ता स्वीकार्य है",
      "rec_risk_sensitive_respiratory": "संवेदनशील व्यक्तियों में श्वसन संबंधी लक्षणों की संभावना बढ़ जाती है।",
      "rec_risk_sensitive_aggravation": "हृदय और फेफड़ों की बीमारी वाले व्यक्तियों और बुजुर्गों में हृदय या फेफड़ों की बीमारी का बढ़ना और समय से पहले मृत्यु।",
      "rec_tip_stay_indoors_possible": "संभव हो तो घर के अंदर रहें",
      "rec_tip_use_purifiers": "घर पर एयर प्यूरीफायर का प्रयोग करें",
      "rec_tip_monitor_symptoms": "खांसी जैसे लक्षणों पर नजर रखें",
      "rec_risk_aggravation": "हृदय या फेफड़ों की बीमारी का बढ़ता हुआ प्रकोप।",
      "rec_risk_widespread_respiratory": "सामान्य आबादी में व्यापक श्वसन प्रभाव।",
      "rec_tip_stay_indoors_filtered": "फ़िल्टर्ड हवा वाले घर के अंदर रहें",
      "rec_tip_wear_n95": "अगर आपको बाहर जाना ही है तो N95 मास्क पहनें",
      "rec_risk_sig_aggravation": "हृदय या फेफड़ों की बीमारी का महत्वपूर्ण बढ़ना।",
      "rec_risk_increased_respiratory": "सामान्य आबादी में श्वसन संबंधी प्रभाव में वृद्धि।",
      "rec_risk_serious_mortality": "हृदय और फेफड़ों की बीमारी वाले व्यक्तियों और बुजुर्गों में समय से पहले मृत्यु का गंभीर खतरा।",
      "rec_tip_emergency_indoors": "आपातकाल: वायु शोधन के साथ घर के अंदर रहें",
      "rec_tip_wear_n99": "यदि बाहरी संपर्क अपरिहार्य है तो N95/N99 मास्क पहनें",
      "rec_risk_serious_respiratory": "सामान्य आबादी में श्वसन संबंधी प्रभावों का गंभीर खतरा।",
      "rec_risk_hazardous_all": "सभी व्यक्तियों, विशेषकर मौजूदा परिस्थितियों वाले लोगों के लिए खतरनाक।",
      "rec_tip_health_alert": "स्वास्थ्य चेतावनी: खतरनाक वायु गुणवत्ता",
      "rec_tip_clean_room": "एयर प्यूरीफायर से एक साफ कमरा बनाएं",
      "rec_tip_follow_advisories": "आधिकारिक स्वास्थ्य सलाह का पालन करें",
      "sensitiveIndividuals": "असामान्य रूप से संवेदनशील लोगों को मामूली श्वसन लक्षण अनुभव हो सकते हैं।",
      "reduceOutdoorActivity": "लंबे समय तक या भारी बाहरी परिश्रम कम करें।",
      "sensitiveGroupsReduce": "संवेदनशील समूहों को बाहरी गतिविधि कम करनी चाहिए।",
      "everyoneRisk": "हर किसी को स्वास्थ्य पर प्रभाव का अनुभव होना शुरू हो सकता है।",
      "avoidOutdoorActivity": "सभी बाहरी परिश्रम से बचें।",
      "avoidoutdooractivities": "बाहरी गतिविधियों से बचें",
      "stayindoorswithfilteredair": "फ़िल्टर्ड हवा वाले घर के अंदर रहें",
      "wearn95masksifyoumustgooutside": "अगर आपको बाहर जाना ही है तो N95 मास्क पहनें",
      "everyoneshouldavoidprolongedoutdoorexertion": "सभी को लंबे समय तक बाहरी परिश्रम से बचना चाहिए",
      "sensitiveGroupsAvoid": "संवेदनशील समूहों को सभी बाहरी गतिविधियों से बचना चाहिए।",
      "healthAlert": "स्वास्थ्य चेतावनी: हर किसी को अधिक गंभीर स्वास्थ्य प्रभाव का अनुभव हो सकता है।",
      "stayIndoors": "सभी को बाहरी परिश्रम से बचना चाहिए।",
      "remainIndoors": "घर के अंदर रहें और गतिविधि का स्तर कम रखें।",
      "seriousRisk": "आपातकालीन स्थितियों की स्वास्थ्य चेतावनी। पूरी आबादी के प्रभावित होने की अधिक संभावना है।",
      "addToPlanner": "योजना में जोड़ें",
      "ozone": "ओजोन",
      "nitrogen_dioxide": "नाइट्रोजन डाइऑक्साइड",

      // Heatmap
      "good_range": "अच्छा (0-50)",
      "moderate_range": "मध्यम (51-100)",
      "unhealthy_range": "अस्वस्थ (101-150)",
      "very_unhealthy_range": "बहुत अस्वस्थ (151-200)",
      "hazardous_range": "खतरनाक (200+)",

      // Community Feedback
      "recentReports": "हाल की रिपोर्टें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
