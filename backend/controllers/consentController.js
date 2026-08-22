import { Consent } from '../models/Consent.js';

export const getConsentStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { purpose } = req.query;

    if (!purpose) {
      return res.status(400).json({
        success: false,
        message: 'Purpose query parameter is required.'
      });
    }

    // Find the latest consent record for the user and purpose
    const consent = await Consent.findOne({ userId, purpose }).sort({ createdAt: -1 });

    if (!consent) {
      return res.status(200).json({
        success: true,
        data: null // No record means consent not asked yet
      });
    }

    // Check if expired
    const isExpired = consent.expiryDate && new Date() > new Date(consent.expiryDate);
    const calculatedStatus = isExpired ? 'expired' : consent.status;

    return res.status(200).json({
      success: true,
      data: {
        userId: consent.userId,
        purpose: consent.purpose,
        status: calculatedStatus,
        consentVersion: consent.consentVersion,
        timestamp: consent.createdAt,
        expiryDate: consent.expiryDate,
        source: consent.source,
        isExpired
      }
    });
  } catch (error) {
    console.error('Failed to get consent status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch consent status.'
    });
  }
};

export const recordConsent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { purpose, status, consentVersion = '1.0', source = 'web' } = req.body;

    if (!purpose || !status) {
      return res.status(400).json({
        success: false,
        message: 'Purpose and status are required fields.'
      });
    }

    const validStatuses = ['granted', 'declined', 'withdrawn', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Calculate expiry date (custom from request, 1 year for granted consent, or null)
    let expiryDate = req.body.expiryDate !== undefined ? req.body.expiryDate : null;
    if (expiryDate === null && status === 'granted') {
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      expiryDate = oneYear;
    }

    const consent = await Consent.create({
      userId,
      purpose,
      status,
      consentVersion,
      expiryDate,
      source
    });

    return res.status(201).json({
      success: true,
      data: consent
    });
  } catch (error) {
    console.error('Failed to record consent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record consent decision.'
    });
  }
};

export const getConsentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { purpose } = req.query;

    const query = { userId };
    if (purpose) {
      query.purpose = purpose;
    }

    const history = await Consent.find(query).sort({ createdAt: -1 });

    // Map to include calculated statuses (e.g. dynamic expiration)
    const mappedHistory = history.map(consent => {
      const isExpired = consent.expiryDate && new Date() > new Date(consent.expiryDate);
      return {
        _id: consent._id,
        userId: consent.userId,
        purpose: consent.purpose,
        status: isExpired ? 'expired' : consent.status,
        consentVersion: consent.consentVersion,
        timestamp: consent.createdAt,
        expiryDate: consent.expiryDate,
        source: consent.source
      };
    });

    return res.status(200).json({
      success: true,
      data: mappedHistory
    });
  } catch (error) {
    console.error('Failed to fetch consent history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch consent history.'
    });
  }
};
