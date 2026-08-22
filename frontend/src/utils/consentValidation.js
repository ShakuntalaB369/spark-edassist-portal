/**
 * Reusable utility to validate if a requested action/purpose is covered by the current consent context.
 * 
 * @param {Object} consentRecord - The user's active consent record (can be null/undefined)
 * @param {string} requiredPurpose - The purpose required for the current action (e.g. 'skill_enhancement_personalization')
 * @returns {Object} Validation result { status, isAllowed, action, message }
 */
export const validateConsentContext = (consentRecord, requiredPurpose) => {
  // 1. Consent does not exist
  if (!consentRecord) {
    return {
      status: 'no_consent',
      isAllowed: false,
      action: 'ask',
      message: "You haven't granted permission for personalized learning analysis."
    };
  }

  // 2. Purpose Mismatch
  if (consentRecord.purpose !== requiredPurpose) {
    return {
      status: 'purpose_mismatch',
      isAllowed: false,
      action: 'warn_block',
      message: `The recorded consent purpose (${consentRecord.purpose}) does not match the requested purpose (${requiredPurpose}).`
    };
  }

  // 3. Expired Consent
  if (consentRecord.status === 'expired' || consentRecord.isExpired === true) {
    return {
      status: 'expired',
      isAllowed: false,
      action: 'review',
      message: "Your previous consent has expired. Please review and provide consent again before personalized analysis can continue."
    };
  }

  // 4. Withdrawn Consent
  if (consentRecord.status === 'withdrawn') {
    return {
      status: 'withdrawn',
      isAllowed: false,
      action: 'block',
      message: "Your current privacy settings don't allow personalized skill analysis because consent for this purpose has been withdrawn."
    };
  }

  // 5. Declined Consent
  if (consentRecord.status === 'declined') {
    return {
      status: 'declined',
      isAllowed: false,
      action: 'ask',
      message: "You haven't granted permission for personalized learning analysis."
    };
  }

  // 6. Active / Granted Consent
  if (consentRecord.status === 'granted') {
    return {
      status: 'valid',
      isAllowed: true,
      action: 'allow'
    };
  }

  // Fallback / Unknown
  return {
    status: 'unknown',
    isAllowed: false,
    action: 'ask',
    message: "Consent is required for personalization features."
  };
};

export default validateConsentContext;
