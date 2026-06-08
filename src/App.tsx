import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_RECENT_BACKERS, 
  TESTIMONIES,
  FUNDING_PROGRESS,
  LAUNCH_COST
} from './data';
import { Backer } from './types';
import {
  UserAccount,
  UserProfile,
  ActivityRecord,
  getUsers,
  getUserByEmail,
  getActivity,
  getMessages,
  getTierProgress,
  saveTierProgress,
  loginUser,
  createUser,
  changePassword,
  resetPassword,
  submitMessage,
  updateUserProfile,
  initiatePayGateTransaction,
  logActivity,
} from './api';

// Imported modular components
import InteractiveSchema from './components/InteractiveSchema';
import BudgetChart from './components/BudgetChart';
import SurveyResults from './components/SurveyResults';
import { InvestmentTable } from './components/InvestmentTable';

// Lucide icon assets
import {
  Rocket, 
  Users, 
  Smartphone, 
  GraduationCap, 
  PiggyBank, 
  TrendingUp, 
  Heart, 
  ShieldCheck, 
  BadgeCheck, 
  PhoneCall, 
  Mail, 
  UserCheck, 
  ClipboardCheck, 
  Clock, 
  Copy, 
  Check, 
  Calendar,
  Share2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
  Menu,
  X,
} from 'lucide-react';
import classroomStudentsImage from './assets/images/classroom_students_1780310259872.png';

const PALIER_DETAILS = [
  {
    title: 'Architecture de base',
    description: "Développement du squelette React hors ligne de l'application.",
  },
  {
    title: 'Passerelle SMS Cloud',
    description: "Synchronisation des serveurs automatisés d'envoi de messages d'alertes instantanées aux parents.",
  },
  {
    title: '03 Établissements Pilotes',
    description: "Acquisition des infrastructures locales et terminaux pour équiper les premières salles.",
  },
  {
    title: 'Déploiement',
    description: "Inauguration de la plateforme dans deux villes du Togo : Lomé et Tsévié.",
  },
];

export default function App() {
  // Campaign State
  const CAMPAGNE_GOAL = FUNDING_PROGRESS.totalGoal; // 30,000,000 FCFA
  const DONATION_TOTAL = 150000;
  const [raisedAmount, setRaisedAmount] = useState<number>(FUNDING_PROGRESS.amountRaised); // 3,455,090 FCFA collecté
  const [backersList, setBackersList] = useState<Backer[]>(INITIAL_RECENT_BACKERS);
  const [hasContributed, setHasContributed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Simulated QA & Contact forms state
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactMsg, setContactMsg] = useState<string>('');
  const [contactError, setContactError] = useState<string>('');
  const [contactSubmitting, setContactSubmitting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Account gate state
  const [registerFirstName, setRegisterFirstName] = useState<string>('');
  const [registerLastName, setRegisterLastName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerDob, setRegisterDob] = useState<string>('');
  const [registerProfession, setRegisterProfession] = useState<string>('');
  const [registerGender, setRegisterGender] = useState<string>('');
  const [registerRole, setRegisterRole] = useState<string>('user');
  const [registerPhotoUrl, setRegisterPhotoUrl] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');
  const [registerSuccess, setRegisterSuccess] = useState<string>('');
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [registerEmailError, setRegisterEmailError] = useState<string>('');

  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('siteAdminAuthenticated') === 'true';
  });
  const [adminResetTarget, setAdminResetTarget] = useState<string>('');
  const [adminResetPassword, setAdminResetPassword] = useState<string>('');
  const [adminResetError, setAdminResetError] = useState<string>('');
  const [adminResetSuccess, setAdminResetSuccess] = useState<string>('');
  const [showAdminResetPassword, setShowAdminResetPassword] = useState<boolean>(false);
  const [showCreateAccount, setShowCreateAccount] = useState<boolean>(false);
  const [showAdminMenu, setShowAdminMenu] = useState<boolean>(false);
  const [showAdminJournal, setShowAdminJournal] = useState<boolean>(false);
  const [showEventLog, setShowEventLog] = useState<boolean>(false);
  const [showUserAccounts, setShowUserAccounts] = useState<boolean>(false);
  const [adminMessages, setAdminMessages] = useState<{ name: string; email: string; message: string; createdAt: string }[]>([]);
  const [tierProgress, setTierProgress] = useState<number[]>([15, 0, 0, 0]);
  const [tierInputs, setTierInputs] = useState<number[]>([15, 0, 0, 0]);
  const [tierSaveMessage, setTierSaveMessage] = useState<string>('');
  const [tierSaveError, setTierSaveError] = useState<string>('');
  const [surveyParentUtility, setSurveyParentUtility] = useState<number>(100);
  const [surveyParentAdoption, setSurveyParentAdoption] = useState<number>(100);
  const [surveyEstablishmentUtility, setSurveyEstablishmentUtility] = useState<number>(100);
  const [surveyEstablishmentAdoption, setSurveyEstablishmentAdoption] = useState<number>(75);
  const [surveyEstablishmentReluctant, setSurveyEstablishmentReluctant] = useState<number>(25);
  const [surveySaveMessage, setSurveySaveMessage] = useState<string>('');
  const [surveySaveError, setSurveySaveError] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState<string>('+228 91551295');
  const [paymentNetwork, setPaymentNetwork] = useState<'FLOOZ' | 'TMONEY'>('TMONEY');
  const [paymentCustomerName, setPaymentCustomerName] = useState<string>('Parent Test');
  const [paymentCustomerEmail, setPaymentCustomerEmail] = useState<string>('parent@example.com');
  const [paymentDescription, setPaymentDescription] = useState<string>('Frais de scolarité supplémentaires');
  const [paymentOrderId, setPaymentOrderId] = useState<string>('ORDER-001');
  const [paymentCallbackUrl, setPaymentCallbackUrl] = useState<string>('https://ecoletrack-5481.onrender.com/api/paygate/callback');
  const [paymentReturnUrl, setPaymentReturnUrl] = useState<string>('https://ecolestrack.vercel.app/paiement/succes');
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentResponse, setPaymentResponse] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentReturnMessage, setPaymentReturnMessage] = useState<string>('');
  const [paymentReturnDetails, setPaymentReturnDetails] = useState<string>('');
  const [adminInvestmentLinkMessage, setAdminInvestmentLinkMessage] = useState<string>('');
  const [passwordChangeEmail, setPasswordChangeEmail] = useState<string>('');
  const [passwordChangeNew, setPasswordChangeNew] = useState<string>('');
  const [passwordChangeConfirm, setPasswordChangeConfirm] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [showPasswordChangeFields, setShowPasswordChangeFields] = useState<boolean>(false);
  const [passwordChangeEmailError, setPasswordChangeEmailError] = useState<string>('');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userActivity, setUserActivity] = useState<ActivityRecord[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('siteCurrentUserEmail') || '';
  });

  type SectionKey = 'hero' | 'probleme' | 'solution' | 'pourquoi' | 'investment' | 'budget' | 'contact' | 'progress';
  const [visibleSections, setVisibleSections] = useState<Record<SectionKey, boolean>>({
    hero: true,
    probleme: true,
    solution: true,
    pourquoi: true,
    investment: true,
    budget: true,
    contact: true,
    progress: true,
  });
  const [currentSection, setCurrentSection] = useState<SectionKey>('hero');
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

  const showSection = (sectionId: SectionKey) => {
    setVisibleSections((prev) => ({ ...prev, [sectionId]: true }));
    setCurrentSection(sectionId);
    setShowMobileNav(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const showAnySection = Object.values(visibleSections).some(Boolean);

  const getNavButtonClasses = (sectionId: SectionKey) => {
    const base = 'px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors';
    if (currentSection === sectionId) {
      return `${base} bg-black text-white shadow-lg`;
    }
    return base;
  };

  // Login state
  const [isLoginMode, setIsLoginMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('siteUserProfile');
      return stored ? true : false;
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginEmailError, setLoginEmailError] = useState<string>('');

  const getDisplayName = (user: Partial<UserProfile> & { name?: string }) => {
    const firstName = String(user.firstName || '').trim();
    const lastName = String(user.lastName || '').trim();
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return String(user.name || '').trim();
  };

  const buildProfileFromStorage = (storedValue: string): UserProfile => {
    const parsed = JSON.parse(storedValue);
    const firstName = String(parsed.firstName || '').trim();
    const lastName = String(parsed.lastName || '').trim();
    const fallbackName = String(parsed.name || '').trim();
    const resolvedFirstName = firstName || fallbackName.split(' ').slice(0, -1).join(' ') || '';
    const resolvedLastName = lastName || fallbackName.split(' ').slice(-1).join('') || '';

    return {
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: String(parsed.email || '').trim(),
      dob: String(parsed.dob || '').trim(),
      profession: String(parsed.profession || '').trim(),
      gender: String(parsed.gender || '').trim(),
      photoUrl: String(parsed.photoUrl || '').trim(),
    };
  };

  const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('siteUserProfile') : null;
  const initialProfile: UserProfile = storedProfile
    ? buildProfileFromStorage(storedProfile)
    : { firstName: '', lastName: '', email: '', dob: '', profession: '', gender: '', photoUrl: '' };

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('siteAccountCreated') === 'true';
    }
    return false;
  });
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const editProfileSectionRef = useRef<HTMLElement | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const adminMenuRef = useRef<HTMLDivElement | null>(null);
  const createAccountRef = useRef<HTMLDivElement | null>(null);
  const userAccountsSectionRef = useRef<HTMLDivElement | null>(null);
  const activityJournalRef = useRef<HTMLDivElement | null>(null);
  const eventLogRef = useRef<HTMLDivElement | null>(null);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(initialProfile);
  const [profileSaveError, setProfileSaveError] = useState<string>('');
  const [profileValidationErrors, setProfileValidationErrors] = useState<string[]>([]);
  const [profileTouched, setProfileTouched] = useState<string[]>([]);
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

  const saveUsers = (nextUsers: UserAccount[]) => {
    setUsers(nextUsers);
  };

  const saveUserActivity = (nextActivity: ActivityRecord[]) => {
    setUserActivity(nextActivity);
  };

  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleScroll = () => {
      setShowProfileMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    if (!showAdminMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };

    const handleScroll = () => setShowAdminMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showAdminMenu]);

  useEffect(() => {
    if (!isEditingProfile) return;

    const element = editProfileSectionRef.current;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy({ top: -120, behavior: 'smooth' });
    }
  }, [isEditingProfile]);

  useEffect(() => {
    if (!showCreateAccount) return;
    const el = createAccountRef.current;
    // wait a tick so layout settles and conditional content is rendered
    const id = window.setTimeout(() => {
      const target = createAccountRef.current || el;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 80);
    return () => window.clearTimeout(id);
  }, [showCreateAccount]);

  const saveAdminMessages = (nextMessages: { name: string; email: string; message: string; createdAt: string }[]) => {
    setAdminMessages(nextMessages);
  };

  const isValidTierProgress = (value: unknown): value is number[] => {
    return (
      Array.isArray(value) &&
      value.length === 4 &&
      value.every(
        (item) => typeof item === 'number' && Number.isFinite(item) && item >= 0 && item <= 100
      )
    );
  };

  const loadTierProgress = async () => {
    if (typeof window === 'undefined') return;
    try {
      const progress = await getTierProgress();
      if (isValidTierProgress(progress)) {
        setTierProgress(progress);
        setTierInputs(progress);
        localStorage.setItem('siteTierProgress', JSON.stringify(progress));
      }
    } catch {
      const saved = localStorage.getItem('siteTierProgress');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (isValidTierProgress(parsed)) {
            setTierProgress(parsed);
            setTierInputs(parsed);
          } else {
            localStorage.removeItem('siteTierProgress');
          }
        } catch {
          localStorage.removeItem('siteTierProgress');
        }
      }
    }
  };

  const handleSaveTierProgress = async () => {
    setTierSaveError('');
    const nextProgress = tierInputs.map((value) => Math.round(Math.max(0, Math.min(100, value))));
    if (!isValidTierProgress(nextProgress)) {
      setTierSaveError('Les valeurs des paliers doivent être quatre nombres entre 0 et 100.');
      return;
    }

    try {
      await saveTierProgress(nextProgress);
      setTierProgress(nextProgress);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteTierProgress', JSON.stringify(nextProgress));
      }
      setTierSaveMessage('Valeurs des paliers enregistrées.');
      setTimeout(() => setTierSaveMessage(''), 4000);
    } catch (error: any) {
      setTierSaveError(error?.message || 'Impossible d’enregistrer les paliers.');
    }
  };

  useEffect(() => {
    loadTierProgress();
  }, []);

  const getTierStatus = (value: number) => {
    if (value <= 0) {
      return 'En attente';
    }
    if (value >= 100) {
      return 'Terminé';
    }
    return 'En cours';
  };

  const getTierBadgeClass = (value: number) => {
    if (value >= 100) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (value > 0) {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-slate-100 text-slate-500';
  };

  const handleTierInputChange = (index: number, newValue: string) => {
    const next = [...tierInputs];
    const parsedValue = Number(newValue);
    next[index] = Number.isFinite(parsedValue) ? Math.max(0, Math.min(100, parsedValue)) : 0;
    setTierInputs(next);
  };

  const isValidSurveyValue = (value: number) => Number.isFinite(value) && value >= 0 && value <= 100;

  const loadSurveyPercentages = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('siteSurveyPercentages');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.parentsUtility === 'number' &&
        typeof parsed.parentsAdoption === 'number' &&
        typeof parsed.establishmentsUtility === 'number' &&
        typeof parsed.establishmentsAdoption === 'number' &&
        typeof parsed.establishmentsReluctant === 'number'
      ) {
        setSurveyParentUtility(Math.max(0, Math.min(100, parsed.parentsUtility)));
        setSurveyParentAdoption(Math.max(0, Math.min(100, parsed.parentsAdoption)));
        setSurveyEstablishmentUtility(Math.max(0, Math.min(100, parsed.establishmentsUtility)));
        setSurveyEstablishmentAdoption(Math.max(0, Math.min(100, parsed.establishmentsAdoption)));
        setSurveyEstablishmentReluctant(Math.max(0, Math.min(100, parsed.establishmentsReluctant)));
      }
    } catch {
      localStorage.removeItem('siteSurveyPercentages');
    }
  };

  const handleSaveSurveyPercentages = () => {
    setSurveySaveError('');
    setSurveySaveMessage('');
    const values = [surveyParentUtility, surveyParentAdoption, surveyEstablishmentUtility, surveyEstablishmentAdoption, surveyEstablishmentReluctant];
    if (!values.every(isValidSurveyValue)) {
      setSurveySaveError('Tous les pourcentages doivent être des nombres compris entre 0 et 100.');
      return;
    }
    if (surveyEstablishmentAdoption + surveyEstablishmentReluctant > 100) {
      setSurveySaveError('La somme des établissements favorables et réticents ne peut pas dépasser 100%.');
      return;
    }
    const payload = {
      parentsUtility: surveyParentUtility,
      parentsAdoption: surveyParentAdoption,
      establishmentsUtility: surveyEstablishmentUtility,
      establishmentsAdoption: surveyEstablishmentAdoption,
      establishmentsReluctant: surveyEstablishmentReluctant,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteSurveyPercentages', JSON.stringify(payload));
    }
    setSurveySaveMessage('Pourcentages des enquêtes enregistrés avec succès.');
    setTimeout(() => setSurveySaveMessage(''), 4000);
  };

  const handleAdminPaymentSubmit = async () => {
    setPaymentError('');
    setPaymentResponse('');

    if (!paymentAmount || paymentAmount <= 0) {
      setPaymentError('Montant de paiement invalide.');
      return;
    }
    
    const errors: string[] = [];
    if (!paymentPhoneNumber || paymentPhoneNumber.trim() === '') errors.push('Téléphone');
    if (!paymentNetwork || paymentNetwork.trim() === '') errors.push('Réseau');
    if (!paymentDescription || paymentDescription.trim() === '') errors.push('Description');
    if (!paymentOrderId || paymentOrderId.trim() === '') errors.push('ID de commande');
    
    if (errors.length > 0) {
      setPaymentError(`Les champs suivants sont obligatoires: ${errors.join(', ')}`);
      return;
    }

    setPaymentProcessing(true);
    try {
      const result = await initiatePayGateTransaction({
        amount: Math.round(paymentAmount),
        phoneNumber: paymentPhoneNumber.trim(),
        network: paymentNetwork,
        description: paymentDescription.trim(),
        identifier: paymentOrderId.trim(),
        customerName: paymentCustomerName,
        customerEmail: paymentCustomerEmail,
      });

      if (result && typeof result === 'object') {
        setPaymentResponse(JSON.stringify(result, null, 2));
      } else {
        setPaymentResponse('Transaction initiée.');
      }
    } catch (error: any) {
      setPaymentError(error?.message || 'Erreur lors de l’initiation du paiement.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleParticipateClick = async () => {
    setPaymentError('');
    setPaymentResponse('');
    setPaymentReturnMessage('');
    setPaymentReturnDetails('');
    setPaymentProcessing(true);

    try {
      const callbackUrl = `${window.location.origin}/api/pay/callback`;
      const returnUrl = `${window.location.origin}/payment-result`;

      const result = await initiatePayGateTransaction({
        amount: 5000,
        phoneNumber: '221000000000',
        network: 'TMONEY',
        description: 'Participation au projet Ecole Track Afrique',
        identifier: `PARTICIPATION-${Date.now()}`,
        customerName: 'Contribution Ecole Track',
        customerEmail: 'participation@ecoletrack.africa',
      });

      const redirectUrl = (result as any).redirect_url || result.redirectUrl || result.redirectUrl;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setPaymentResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setPaymentError(error?.message || 'Erreur lors de l’initiation du paiement.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleDonateClick = async () => {
    setPaymentError('');
    setPaymentResponse('');
    setPaymentReturnMessage('');
    setPaymentReturnDetails('');
    setPaymentProcessing(true);

    try {
      const result = await initiatePayGateTransaction({
        amount: 1000,
        phoneNumber: '+228 91551295',
        network: 'TMONEY',
        description: 'Don volontaire pour le projet Ecole Track Afrique',
        identifier: `DON-${Date.now()}`,
        customerName: 'Don pour Ecole Track',
        customerEmail: 'donateur@ecoletrack.africa',
      });

      // Check for redirect URL from PayGate
      const redirectUrl = (result as any).redirect_url || (result as any).redirectUrl;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      // If error_code present, show error message
      if ((result as any).error_code || (result as any).error_message) {
        setPaymentError(`PayGate: ${(result as any).error_message || 'Erreur PayGate'}`);
        return;
      }

      setPaymentResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setPaymentError(error?.message || 'Erreur lors de l’initiation du don.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleAdminInvestmentLink = () => {
    const investedAmount = raisedAmount - DONATION_TOTAL;
    setAdminInvestmentLinkMessage(
      `Montant investi calculé : ${formatFCFA(investedAmount)}. ` +
      `(${formatFCFA(raisedAmount)} - ${formatFCFA(DONATION_TOTAL)} = ${formatFCFA(investedAmount)})`
    );
  };

  useEffect(() => {
    loadTierProgress();
    loadSurveyPercentages();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;
    if (path !== '/payment-result' && path !== '/paiement/succes') return;

    const params = new URLSearchParams(window.location.search);
    const entries = Array.from(params.entries());
    if (entries.length === 0) {
      setPaymentReturnMessage('Retour de paiement reçu sans paramètres supplémentaires.');
      return;
    }

    const status = params.get('status') || params.get('payment_status') || 'Retour de paiement reçu';
    setPaymentReturnMessage(status);
    setPaymentReturnDetails(entries.map(([key, value]) => `${key}: ${value}`).join(' · '));
  }, []);

  const isValidEmail = (email: string) => {
    return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const logUserActivity = (email: string, action: string) => {
    const nextActivity = [
      { email, action, createdAt: new Date().toLocaleString('fr-FR') },
      ...userActivity,
    ].slice(0, 50);
    saveUserActivity(nextActivity);
    logActivity(email, action).catch(() => {
      // Ignorer l'erreur backend si le serveur n'est pas disponible.
    });
  };

  const loadUsers = async () => {
    try {
      const allUsers = await getUsers();
      saveUsers(allUsers);
    } catch {
      // Backend inaccessible ou erreur API.
    }
  };

  const loadActivityList = async () => {
    try {
      const activityList = await getActivity();
      saveUserActivity(activityList);
    } catch {
      // Backend inaccessible ou erreur API.
    }
  };

  const loadAdminMessages = async () => {
    try {
      const messages = await getMessages();
      saveAdminMessages(messages);
    } catch {
      // Backend inaccessible ou erreur API.
    }
  };

  const loadCurrentProfile = async (email: string) => {
    try {
      const user = await getUserByEmail(email);
      setProfile(user);
      setProfileDraft(user);
    } catch {
      // Profil introuvable, rester sur l'état actuel.
    }
  };

  const saveCurrentUserEmail = (email: string) => {
    setCurrentUserEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteCurrentUserEmail', email);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentUserEmail) {
      loadCurrentProfile(currentUserEmail);
    }
    if (isAdminAuthenticated) {
      loadUsers();
      loadActivityList();
      loadAdminMessages();
    }
  }, [currentUserEmail, isAdminAuthenticated]);

  const ADMIN_EMAIL = 'admin@admin.com';
  const ADMIN_PASSWORD = 'Admin@123';

  // Compute stats
  const backersCount = 12 + (backersList.length - INITIAL_RECENT_BACKERS.length);
  const totalDonorCount = 8;
  const totalInvestorCount = backersCount;
  const totalDonationAmount = DONATION_TOTAL;
  const totalInvestedAmount = Math.max(0, raisedAmount - DONATION_TOTAL);
  const totalMobilizedAmount = totalDonationAmount + totalInvestedAmount;
  const remainingToMobilize = Math.max(0, CAMPAGNE_GOAL - totalMobilizedAmount);
  const rawPercentage = (raisedAmount / CAMPAGNE_GOAL) * 100;
  const percentage = Math.min(100, Math.round(rawPercentage * 10) / 10);
  const remainingAmount = Math.max(0, CAMPAGNE_GOAL - raisedAmount);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const launchCost = LAUNCH_COST;
  const launchCostShare = Math.round((launchCost / CAMPAGNE_GOAL) * 100);

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('investment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRegisterPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRegisterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setProfileDraft((prev: UserProfile) => ({ ...prev, photoUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!registerFirstName.trim() || !registerLastName.trim() || !registerEmail.trim() || !registerDob.trim() || !registerProfession.trim() || !registerGender.trim() || !registerPassword.trim()) {
      const errors: string[] = [];
      if (!registerFirstName.trim()) errors.push('Prénom(s)');
      if (!registerLastName.trim()) errors.push('Nom');
      if (!registerEmail.trim()) errors.push('Email');
      if (!registerPassword.trim()) errors.push('Mot de passe temporaire');
      if (!registerDob.trim()) errors.push('Date de naissance');
      if (!registerProfession.trim()) errors.push('Profession');
      if (!registerGender.trim()) errors.push('Sexe');
      setRegisterError(`Les champs suivants sont obligatoires: ${errors.join(', ')}`);
      return;
    }
    if (!registerEmail.includes('@')) {
      setRegisterError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (registerPassword.trim().length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      const result = await createUser({
        firstName: registerFirstName.trim(),
        lastName: registerLastName.trim(),
        email: registerEmail.trim(),
        dob: registerDob,
        profession: registerProfession.trim(),
        gender: registerGender.trim(),
        role: registerRole,
        photoUrl: registerPhotoUrl,
        password: registerPassword.trim(),
      });

      if (result && result.verificationLink) {
        setRegisterSuccess(`Compte créé. Vérifiez l'email à l'adresse suivante: ${result.verificationLink}`);
        setTimeout(() => setRegisterSuccess(''), 20000);
      }

      logUserActivity(registerEmail.trim(), 'Compte utilisateur créé par l’administrateur');
      if (isAdminAuthenticated) {
        const updatedUsers = await getUsers();
        saveUsers(updatedUsers);
      }

      setRegisterFirstName('');
      setRegisterLastName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterDob('');
      setRegisterProfession('');
      setRegisterGender('');
      setRegisterPhotoUrl('');
      setRegisterError('');
    } catch (error: any) {
      setRegisterError(error?.message || 'Impossible de créer le compte utilisateur.');
    }
  };


  const handleLogout = () => {
    const logoutEmail = currentUserEmail || profile.email;
    if (logoutEmail) {
      logUserActivity(logoutEmail, 'Déconnexion');
    }
    setIsRegistered(false);
    setShowProfileMenu(false);
    setCurrentUserEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siteAccountCreated');
      localStorage.removeItem('siteCurrentUserEmail');
      localStorage.removeItem('siteAuthToken');
      localStorage.removeItem('siteAdminAuthenticated');
      localStorage.removeItem('siteUserProfile');
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      const { user, mustChangePassword, token } = await loginUser(loginEmail.trim(), loginPassword);
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('siteAuthToken', token);
      }
      setProfile(user);
      setProfileDraft(user);
      setCurrentUserEmail(user.email);
      saveCurrentUserEmail(user.email);

      if (mustChangePassword) {
        setPasswordChangeEmail(user.email);
        setPasswordChangeError('');
        setLoginEmail('');
        setLoginPassword('');
        return;
      }

      setIsRegistered(true);
      // mark admin authenticated if role === admin
      const isAdmin = String(user.role || '').toLowerCase() === 'admin';
      setIsAdminAuthenticated(isAdmin);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteAdminAuthenticated', isAdmin ? 'true' : 'false');
      }
      logUserActivity(user.email, 'Connexion');
      setLoginEmail('');
      setLoginPassword('');
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteAccountCreated', 'true');
        localStorage.setItem('siteUserProfile', JSON.stringify(user));
      }
    } catch (error: any) {
      setLoginError(error?.message || 'Échec de la connexion.');
    }
  };

  const handleOpenEditProfile = () => {
    setProfileDraft(profile);
    setIsEditingProfile(true);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = async () => {
    setProfileSaveError('');
    
    const errors: string[] = [];
    if (!profileDraft.lastName.trim()) errors.push('Nom');
    if (!profileDraft.firstName.trim()) errors.push('Prénom(s)');
    if (!profileDraft.gender.trim()) errors.push('Sexe');
    if (!profileDraft.email.trim()) errors.push('Email');

    if (errors.length > 0) {
      setProfileSaveError(`Les champs suivants sont obligatoires: ${errors.join(', ')}`);
      setProfileValidationErrors(errors);
      return;
    }

    if (!profileDraft.email.includes('@')) {
      setProfileSaveError('Veuillez saisir une adresse email valide.');
      setProfileValidationErrors(['Email']);
      return;
    }

    const oldEmail = currentUserEmail || profile.email;
    try {
      const updatedUser = await updateUserProfile(oldEmail, profileDraft);
      setProfile(updatedUser);
      setProfileDraft(updatedUser);
        setProfileValidationErrors([]);
      setIsEditingProfile(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteUserProfile', JSON.stringify(updatedUser));
      }
      if (oldEmail.toLowerCase() !== updatedUser.email.toLowerCase()) {
        saveCurrentUserEmail(updatedUser.email);
      }
      const updatedUsers = users.map((user) =>
        user.email.toLowerCase() === oldEmail.toLowerCase()
          ? { ...user, ...updatedUser }
          : user
      );
      saveUsers(updatedUsers);
      logUserActivity(updatedUser.email, 'Profil utilisateur modifié');
    } catch (error: any) {
      const message = error?.message || 'Impossible de mettre à jour le profil.';
      setProfileSaveError(message);
        // keep validation highlights as-is when server returns an error
      console.error('Impossible de mettre à jour le profil:', message);
    }
  };

  const handleAdminLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError('Veuillez saisir vos identifiants administrateur.');
      return;
    }

    if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
      setAdminError('Email ou mot de passe administrateur incorrect.');
      return;
    }

    setIsAdminAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteAdminAuthenticated', 'true');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    setAdminResetTarget('');
    setAdminResetPassword('');
    setAdminResetError('');
    setAdminResetSuccess('');
    setAdminMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siteAdminAuthenticated');
    }
  };

  const handleAdminStartReset = (email: string) => {
    setAdminResetTarget(email);
    setAdminResetPassword('');
    setAdminResetError('');
    setAdminResetSuccess('');
  };

  const handleAdminConfirmReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminResetTarget) {
      setAdminResetError('Veuillez sélectionner un utilisateur.');
      return;
    }
    if (!adminResetPassword.trim()) {
      setAdminResetError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (adminResetPassword.length < 6) {
      setAdminResetError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await resetPassword(adminResetTarget, adminResetPassword);
      setAdminResetSuccess('Mot de passe réinitialisé. L’utilisateur devra le changer à sa prochaine connexion.');
      setAdminResetError('');
      setAdminResetTarget('');
      setAdminResetPassword('');
      if (isAdminAuthenticated) {
        const updatedUsers = await getUsers();
        saveUsers(updatedUsers);
      }
      logUserActivity(adminResetTarget, 'Mot de passe administrateur réinitialisé');
    } catch (error: any) {
      setAdminResetError(error?.message || 'Impossible de réinitialiser le mot de passe.');
    }
  };

  const handlePasswordChangeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (!passwordChangeNew.trim() || !passwordChangeConfirm.trim()) {
      setPasswordChangeError('Veuillez renseigner le nouveau mot de passe et la confirmation.');
      return;
    }
    if (passwordChangeNew !== passwordChangeConfirm) {
      setPasswordChangeError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordChangeNew.length < 6) {
      setPasswordChangeError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await changePassword(passwordChangeEmail, passwordChangeNew);
      const updatedUser = await getUserByEmail(passwordChangeEmail);

      setProfile(updatedUser);
      setProfileDraft(updatedUser);
      setIsRegistered(true);
      saveCurrentUserEmail(updatedUser.email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteAccountCreated', 'true');
        localStorage.setItem('siteUserProfile', JSON.stringify(updatedUser));
      }
      logUserActivity(updatedUser.email, 'Modification du mot de passe');
      setPasswordChangeEmail('');
      setPasswordChangeNew('');
      setPasswordChangeConfirm('');
    } catch (error: any) {
      setPasswordChangeError(error?.message || 'Impossible de modifier le mot de passe.');
    }
  };

  // Handle Contact Form Submission
  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;

    setContactError('');
    setContactSubmitting(true);

    try {
      await submitMessage({
        name: contactName,
        email: contactEmail,
        message: contactMsg,
      });

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (error: any) {
      setContactError(error?.message || 'Impossible d’envoyer la requête. Veuillez réessayer.');
    } finally {
      setContactSubmitting(false);
    }
  };

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-7xl min-h-[70vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          {!isAdminAuthenticated ? (
            <div>
              <div className="text-center mb-8">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-3">Connectez-vous pour gérer les comptes utilisateurs et suivre les connexions.</p>
              </div>

              {adminError && (
                <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Email administrateur</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    placeholder="admin@admin.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    placeholder="Mot de passe admin"
                  />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all">
                  Se connecter en tant qu'admin
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Tableau de bord administrateur</h1>
                  <p className="text-slate-400 text-sm mt-2">Gestion des comptes utilisateurs et suivi des connexions.</p>
                </div>
                <div className="flex items-center gap-3 relative">
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all"
                  >
                    Déconnexion admin
                  </button>

                  <div ref={adminMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAdminMenu((s) => !s)}
                      aria-label="Menu admin"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-all"
                    >
                      ⋮
                    </button>
                    {showAdminMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg z-50">
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEventLog(true);
                              setShowCreateAccount(false);
                              setShowAdminJournal(false);
                              setShowUserAccounts(false);
                              setShowAdminMenu(false);
                              setTimeout(() => {
                                eventLogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 50);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-slate-800"
                          >
                            Voir le journal d'événements
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateAccount(true);
                              setShowAdminJournal(false);
                              setShowEventLog(false);
                              setShowUserAccounts(false);
                              setShowAdminMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-slate-800"
                          >
                            Créer un compte utilisateur
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdminJournal(true);
                              setShowCreateAccount(false);
                              setShowEventLog(false);
                              setShowUserAccounts(false);
                              setShowAdminMenu(false);
                              setTimeout(() => {
                                activityJournalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 50);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-slate-800"
                          >
                            Voir le journal de connexion
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateAccount(false);
                              setShowAdminJournal(false);
                              setShowEventLog(false);
                              setShowUserAccounts(true);
                              setShowAdminMenu(false);
                              setTimeout(() => {
                                userAccountsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 50);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-slate-800"
                          >
                            Voir les comptes utilisateurs
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(adminResetSuccess || adminResetError) && (
                <div className="mb-6 space-y-3">
                  {adminResetSuccess && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 text-sm">
                      {adminResetSuccess}
                    </div>
                  )}
                  {adminResetError && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                      {adminResetError}
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Montant total du don</p>
                  <p className="text-3xl font-bold mt-4 text-brand-green">{formatFCFA(totalDonationAmount)}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Montant total investi</p>
                  <p className="text-3xl font-bold mt-4 text-brand-green">{formatFCFA(totalInvestedAmount)}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Montant total mobilisé</p>
                  <p className="text-3xl font-bold mt-4 text-brand-green">{formatFCFA(totalMobilizedAmount)}</p>
                </div>
                <div className="rounded-3xl border border-amber-300 bg-amber-400/10 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">Montant restant à mobiliser</p>
                  <p className="text-3xl font-bold mt-4 text-amber-800">{formatFCFA(remainingToMobilize)}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Nombre de donateurs</p>
                  <p className="text-3xl font-bold mt-4 text-brand-green">{totalDonorCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Nombre d'investisseurs</p>
                  <p className="text-3xl font-bold mt-4 text-brand-green">{totalInvestorCount}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Vérification investissement</h2>
                <p className="text-sm text-slate-400 mb-4">Cliquez sur le lien pour vérifier que la différence entre le montant collecté et le montant du don correspond au montant investi.</p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminInvestmentLink();
                  }}
                  className="inline-flex items-center rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                >
                  Vérifier le lien collecte / don / investissement
                </a>
                {adminInvestmentLinkMessage && (
                  <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm text-slate-200">
                    {adminInvestmentLinkMessage}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Évolution des paliers</h2>
                <p className="text-sm text-slate-400 mb-5">Saisissez des pourcentages pour que les utilisateurs voient l’avancement des paliers.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tierInputs.map((value, index) => (
                    <div key={index} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                      <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Palier {index + 1} (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => handleTierInputChange(index, e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <button
                    type="button"
                    onClick={handleSaveTierProgress}
                    className="rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Enregistrer les paliers
                  </button>
                  {tierSaveMessage && (
                    <span className="text-sm text-emerald-300">{tierSaveMessage}</span>
                  )}
                  {tierSaveError && (
                    <span className="text-sm text-red-300">{tierSaveError}</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Pourcentages des résultats d'enquête</h2>
                <p className="text-sm text-slate-400 mb-5">
                  Modifiez les données affichées dans la section "Résultats des enquêtes" du site.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Utilité perçue par les parents (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={surveyParentUtility}
                      onChange={(e) => setSurveyParentUtility(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Adoption par les parents (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={surveyParentAdoption}
                      onChange={(e) => setSurveyParentAdoption(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Utilité perçue par les établissements (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={surveyEstablishmentUtility}
                      onChange={(e) => setSurveyEstablishmentUtility(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Établissements favorables (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={surveyEstablishmentAdoption}
                      onChange={(e) => setSurveyEstablishmentAdoption(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Établissements réticents (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={surveyEstablishmentReluctant}
                      onChange={(e) => setSurveyEstablishmentReluctant(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <button
                    type="button"
                    onClick={handleSaveSurveyPercentages}
                    className="rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Enregistrer les résultats d'enquête
                  </button>
                  {surveySaveMessage && <span className="text-sm text-emerald-300">{surveySaveMessage}</span>}
                  {surveySaveError && <span className="text-sm text-red-300">{surveySaveError}</span>}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Initier une transaction de paiement</h2>
                <p className="text-sm text-slate-400 mb-5">Lancez un paiement via PayGateGlobal depuis l’espace administrateur.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Montant</label>
                    <input
                      type="number"
                      min={1}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Téléphone du client</label>
                    <input
                      type="tel"
                      value={paymentPhoneNumber}
                      onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Réseau</label>
                    <select
                      value={paymentNetwork}
                      onChange={(e) => setPaymentNetwork(e.target.value as 'FLOOZ' | 'TMONEY')}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    >
                      <option value="TMONEY">TMONEY</option>
                      <option value="FLOOZ">FLOOZ</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Nom du client</label>
                    <input
                      type="text"
                      value={paymentCustomerName}
                      onChange={(e) => setPaymentCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Email du client</label>
                    <input
                      type="email"
                      value={paymentCustomerEmail}
                      onChange={(e) => setPaymentCustomerEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Description</label>
                    <input
                      type="text"
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">ID de commande</label>
                    <input
                      type="text"
                      value={paymentOrderId}
                      onChange={(e) => setPaymentOrderId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">URL de callback</label>
                    <input
                      type="url"
                      value={paymentCallbackUrl}
                      onChange={(e) => setPaymentCallbackUrl(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">URL de retour</label>
                    <input
                      type="url"
                      value={paymentReturnUrl}
                      onChange={(e) => setPaymentReturnUrl(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <button
                    type="button"
                    onClick={handleAdminPaymentSubmit}
                    disabled={paymentProcessing}
                    className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue/90 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paymentProcessing ? 'En cours...' : 'Initier le paiement'}
                  </button>
                  {paymentResponse && <span className="text-sm text-emerald-300 break-words">{paymentResponse}</span>}
                  {paymentError && <span className="text-sm text-red-300 break-words">{paymentError}</span>}
                </div>
              </div>

              {showEventLog && (
                <div ref={eventLogRef} className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Journal d'événements</h2>
                  <div className="space-y-3">
                    {userActivity.length === 0 ? (
                      <p className="text-sm text-slate-400">Aucun événement enregistré.</p>
                    ) : (
                      userActivity.slice(0, 3).map((event, index) => (
                        <div key={`${event.email}-${index}`} className="rounded-2xl bg-slate-900 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-300">{event.email}</span>
                            <span className="text-xs text-slate-500">{event.createdAt}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200">{event.action}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {showAdminJournal && (
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Journal de connexion</h2>
                  <div className="space-y-3">
                    {userActivity.length === 0 ? (
                      <p className="text-sm text-slate-400">Aucun événement enregistré.</p>
                    ) : (
                      userActivity.slice(0, 3).map((event, index) => (
                        <div key={`${event.email}-${index}`} className="rounded-2xl bg-slate-900 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-300">{event.email}</span>
                            <span className="text-xs text-slate-500">{event.createdAt}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200">{event.action}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div ref={createAccountRef} className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                {showCreateAccount && (
                  <>
                    {registerError && (
                      <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                        {registerError}
                      </div>
                    )}
                    {registerSuccess && (
                      <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 text-sm">
                        {registerSuccess}
                      </div>
                    )}
                <p className="text-slate-400 text-sm mb-4">
                  Le mot de passe est temporaire. L’utilisateur devra le changer à sa première connexion.
                </p>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Nom <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        placeholder="Nom"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Prénom(s) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        placeholder="Prénom(s)"
                        type="text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Adresse email <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      value={registerEmail}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRegisterEmail(v);
                        setRegisterEmailError(v && !isValidEmail(v) ? 'Adresse email invalide.' : '');
                      }}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                      placeholder="email@exemple.com"
                      type="email"
                    />
                    {registerEmailError && (
                      <div className="mt-2 text-xs text-red-300">{registerEmailError}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Mot de passe temporaire <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pr-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        placeholder="Au moins 6 caractères"
                        type={showRegisterPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-label={showRegisterPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Date de naissance <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        value={registerDob}
                        onChange={(e) => setRegisterDob(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        type="date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Profession <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        value={registerProfession}
                        onChange={(e) => setRegisterProfession(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        placeholder="Ex: Enseignant, Entrepreneur, Parent"
                        type="text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Sexe <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={registerGender}
                      onChange={(e) => setRegisterGender(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Rôle du compte <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Photo de profil (optionnelle)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRegisterPhoto}
                      className="w-full text-slate-200 text-sm file:rounded-full file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-slate-950"
                    />
                    {registerPhotoUrl && (
                      <img src={registerPhotoUrl} alt="Aperçu photo" className="mt-3 h-24 w-24 max-w-full max-h-full rounded-full object-cover border border-slate-700" />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Créer le compte utilisateur
                  </button>
                    </form>
                  </>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Utilisateurs enregistrés</p>
                  <p className="text-3xl font-bold mt-4 text-white">{users.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Événements récents</p>
                  <p className="text-3xl font-bold mt-4 text-white">{userActivity.length}</p>
                </div>
              </div>

              {showUserAccounts && (
                <div ref={userAccountsSectionRef} className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Comptes utilisateurs</h2>
                  <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 font-semibold">Nom</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Profession</th>
                        <th className="px-3 py-2 font-semibold">Créé le</th>
                        <th className="px-3 py-2 font-semibold">État</th>
                        <th className="px-3 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.email} className="border-t border-slate-700">
                          <td className="px-3 py-3">{getDisplayName(user)}</td>
                          <td className="px-3 py-3">{user.email}</td>
                          <td className="px-3 py-3">{user.profession}</td>
                          <td className="px-3 py-3">{user.createdAt}</td>
                          <td className="px-3 py-3">
                            {user.mustChangePassword ? (
                              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                                Changement requis
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-2">
                              {adminResetTarget === user.email ? (
                                <form onSubmit={handleAdminConfirmReset} className="space-y-2">
                                  <div className="relative">
                                    <input
                                      value={adminResetPassword}
                                      onChange={(e) => setAdminResetPassword(e.target.value)}
                                      className="w-full pr-12 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-green"
                                      type={showAdminResetPassword ? 'text' : 'password'}
                                      placeholder="Nouveau mot de passe"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowAdminResetPassword((s) => !s)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                      aria-label={showAdminResetPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    >
                                      {showAdminResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="rounded-xl bg-brand-green px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-brand-green/90 transition-all"
                                    >
                                      Valider
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAdminResetTarget('')}
                                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAdminStartReset(user.email)}
                                  className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/20 transition-all"
                                >
                                  Réinitialiser
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const keptUsers = users.filter((item) => item.email !== user.email);
                                  saveUsers(keptUsers);
                                  if (currentUserEmail.toLowerCase() === user.email.toLowerCase()) {
                                    handleLogout();
                                  }
                                }}
                                className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 transition-all"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Messages sécurisés reçus</h2>
                <div className="space-y-3">
                  {adminMessages.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun message sécurisé reçu pour le moment.</p>
                  ) : (
                    adminMessages.map((item, index) => (
                      <div key={`${item.email}-${index}`} className="rounded-2xl bg-slate-900 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-300 font-semibold">{item.name} · {item.email}</p>
                            <p className="text-xs text-slate-500">{item.createdAt}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-200">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {showAdminJournal && (
                <div ref={activityJournalRef} className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Journal de connexion</h2>
                  <div className="space-y-3">
                    {userActivity.length === 0 ? (
                      <p className="text-sm text-slate-400">Aucun événement enregistré.</p>
                    ) : (
                      userActivity.map((event, index) => (
                        <div key={`${event.email}-${index}`} className="rounded-2xl bg-slate-900 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-300">{event.email}</span>
                            <span className="text-xs text-slate-500">{event.createdAt}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200">{event.action}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (passwordChangeEmail) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Changement de mot de passe</h1>
            <p className="text-slate-400 text-sm mt-3">
              Vous devez changer votre mot de passe avant de pouvoir accéder au site.
            </p>
          </div>

          {passwordChangeError && (
            <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              {passwordChangeError}
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  value={passwordChangeNew}
                  onChange={(e) => setPasswordChangeNew(e.target.value)}
                  className="w-full pr-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                  placeholder="Nouveau mot de passe"
                  type={showPasswordChangeFields ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeFields((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPasswordChangeFields ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPasswordChangeFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Confirmation du mot de passe</label>
              <input
                value={passwordChangeConfirm}
                onChange={(e) => setPasswordChangeConfirm(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="Confirmez le mot de passe"
                type={showPasswordChangeFields ? 'text' : 'password'}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
            >
              Valider le nouveau mot de passe
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Se connecter</h1>
            <p className="text-slate-400 text-sm mt-3">
              Connectez-vous avec votre email et mot de passe. La création de compte est réservée à l’administrateur.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Adresse email</label>
              <input
                value={loginEmail}
                onChange={(e) => {
                  const v = e.target.value;
                  setLoginEmail(v);
                  setLoginEmailError(v && !isValidEmail(v) ? 'Adresse email invalide.' : '');
                }}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="email@exemple.com"
                type="email"
              />
              {loginEmailError && (
                <div className="mt-2 text-xs text-red-300">{loginEmailError}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pr-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                  placeholder="Votre mot de passe"
                  type={showLoginPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
            >
              Se connecter
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            Les comptes sont créés uniquement par l’administrateur. Contactez un administrateur si vous n’avez pas encore d’accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-brand-green/20 selection:text-brand-blue">
      
      {/* Top Banner Ticker Alert */}
      <div className="bg-brand-blue text-xs text-white py-2 px-4 shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
            <span>Campagne Active : Suivi Scolaire en temps réel.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Financement visé : {formatFCFA(CAMPAGNE_GOAL)}</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Lancement prévu : Troisième trimestre 2027</span>
          </div>
        </div>
      </div>

      {/* Modern Compact Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm">
              <span className="text-xl text-brand-green">E</span>T
            </div>
            <div>
              <span className="font-extrabold text-brand-blue tracking-tight text-lg block leading-none">Ecole Track</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-0.5">Mécénat Éducatif</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 ml-6">
            <button type="button" onClick={() => showSection('hero')} className={getNavButtonClasses('hero')}>Accueil</button>
            <button type="button" onClick={() => showSection('probleme')} className={getNavButtonClasses('probleme')}>Le Problème</button>
            <button type="button" onClick={() => showSection('solution')} className={getNavButtonClasses('solution')}>Notre Solution</button>
            <button type="button" onClick={() => showSection('pourquoi')} className={getNavButtonClasses('pourquoi')}>Pourquoi Investir ?</button>
            <button type="button" onClick={() => showSection('investment')} className={getNavButtonClasses('investment')}>Revenus sur investissement</button>
            <button type="button" onClick={() => showSection('budget')} className={getNavButtonClasses('budget')}>Financement</button>
            <button type="button" onClick={() => showSection('progress')} className={getNavButtonClasses('progress')}>État d'avancement</button>
          </nav>

          <button
            type="button"
            onClick={() => setShowMobileNav((prev) => !prev)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-label="Ouvrir le menu mobile"
          >
            {showMobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative">
            {isRegistered && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm"
                >
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profil" className="h-full w-full max-w-full max-h-full object-cover" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-slate-700" />
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-3xl bg-white border border-slate-200 shadow-xl text-slate-800 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mon compte</p>
                      <p className="font-semibold text-sm mt-2 truncate">{getDisplayName(profile) || 'Utilisateur'}</p>
                      <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100"
                    >
                      Éditer le profil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-slate-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleParticipateClick}
                className="px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5"
              >
                <span>J'investis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDonateClick}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow-md"
              >
                Faire un don
              </button>
            </div>
          </div>
        </div>
      </header>

      {showMobileNav && (
        <div className="lg:hidden bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid gap-2">
            <button type="button" onClick={() => showSection('hero')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Accueil
            </button>
            <button type="button" onClick={() => showSection('probleme')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Le Problème
            </button>
            <button type="button" onClick={() => showSection('solution')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Notre Solution
            </button>
            <button type="button" onClick={() => showSection('pourquoi')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Pourquoi Investir ?
            </button>
            <button type="button" onClick={() => showSection('investment')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Revenus sur investissement
            </button>
            <button type="button" onClick={() => showSection('budget')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              Financement
            </button>
            <button type="button" onClick={() => showSection('progress')} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
              État d'avancement
            </button>
          </div>
        </div>
      )}

      {paymentReturnMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="rounded-3xl border border-brand-green/20 bg-brand-green/5 text-brand-green p-4 text-sm">
            <strong className="font-semibold">Résultat de paiement :</strong> {paymentReturnMessage}
            {paymentReturnDetails && <div className="mt-2 text-slate-700">{paymentReturnDetails}</div>}
          </div>
        </div>
      )}

      {isEditingProfile && (
        <section ref={editProfileSectionRef} className="scroll-mt-40 bg-slate-100 border-b border-slate-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                    {profileDraft.photoUrl ? (
                      <img src={profileDraft.photoUrl} alt="Aperçu profil" className="h-full w-full max-w-full max-h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-slate-700">
                        {[profileDraft.firstName, profileDraft.lastName]
                          .filter(Boolean)
                          .map((part) => part.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('') || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Édition de profil</p>
                    <h2 className="text-xl font-bold text-slate-900">Modifier vos informations</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Nom <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      value={profileDraft.lastName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileDraft((prev) => ({ ...prev, lastName: val }));
                        if (val.trim()) setProfileValidationErrors((prev) => prev.filter((p) => p !== 'Nom'));
                      }}
                      onBlur={() => setProfileTouched((prev) => (prev.includes('Nom') ? prev : [...prev, 'Nom']))}
                      className={`w-full rounded-2xl border ${profileValidationErrors.includes('Nom') || (profileTouched.includes('Nom') && !profileDraft.lastName.trim()) ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green`}
                      type="text"
                    />
                    {profileValidationErrors.includes('Nom') && (
                      <p className="text-xs text-red-500 mt-1">Ce champ est requis</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Prénom(s) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      value={profileDraft.firstName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileDraft((prev) => ({ ...prev, firstName: val }));
                        if (val.trim()) setProfileValidationErrors((prev) => prev.filter((p) => p !== 'Prénom(s)'));
                      }}
                      onBlur={() => setProfileTouched((prev) => (prev.includes('Prénom(s)') ? prev : [...prev, 'Prénom(s)']))}
                      className={`w-full rounded-2xl border ${profileValidationErrors.includes('Prénom(s)') || (profileTouched.includes('Prénom(s)') && !profileDraft.firstName.trim()) ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green`}
                      type="text"
                    />
                    {profileValidationErrors.includes('Prénom(s)') && (
                      <p className="text-xs text-red-500 mt-1">Ce champ est requis</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Email <span className="text-red-500 font-bold">*</span></label>
                    <input
                      value={profileDraft.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileDraft((prev) => ({ ...prev, email: val }));
                        if (val.includes('@')) setProfileValidationErrors((prev) => prev.filter((p) => p !== 'Email'));
                      }}
                      onBlur={() => setProfileTouched((prev) => (prev.includes('Email') ? prev : [...prev, 'Email']))}
                      className={`w-full rounded-2xl border ${profileValidationErrors.includes('Email') || (profileTouched.includes('Email') && !profileDraft.email.trim()) || (profileTouched.includes('Email') && profileDraft.email.trim() && !profileDraft.email.includes('@')) ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green`}
                      type="email"
                    />
                    {profileValidationErrors.includes('Email') && (
                      <p className="text-xs text-red-500 mt-1">{profileDraft.email.trim() ? 'Email non valide' : 'Ce champ est requis'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Date de naissance</label>
                    <input
                      value={profileDraft.dob}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, dob: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="date"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Profession</label>
                    <input
                      value={profileDraft.profession}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, profession: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Sexe <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={profileDraft.gender}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileDraft((prev) => ({ ...prev, gender: val }));
                        if (val.trim()) setProfileValidationErrors((prev) => prev.filter((p) => p !== 'Sexe'));
                      }}
                      onBlur={() => setProfileTouched((prev) => (prev.includes('Sexe') ? prev : [...prev, 'Sexe']))}
                      className={`w-full rounded-2xl border ${profileValidationErrors.includes('Sexe') || (profileTouched.includes('Sexe') && !profileDraft.gender.trim()) ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green`}
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {profileValidationErrors.includes('Sexe') && (
                      <p className="text-xs text-red-500 mt-1">Ce champ est requis</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Photo de profil</label>
                  <div className="flex items-center gap-3">
                    <label htmlFor="edit-profile-photo" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <path d="M12 15V3" />
                      </svg>
                      Choisir un fichier
                    </label>
                    {profileDraft.photoUrl ? (
                      <img src={profileDraft.photoUrl} alt="Aperçu du profil" className="h-14 w-14 max-w-full max-h-full rounded-full object-cover border border-slate-300" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 text-sm">
                        Aucun
                      </div>
                    )}
                  </div>
                  <input
                    id="edit-profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhoto}
                    className="sr-only"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Enregistrer le profil
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Annuler
                  </button>
                </div>
                {profileSaveError && (
                  <div className="mt-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 text-sm">
                    {profileSaveError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live State Alert Ticker when someone contributes */}
      <AnimatePresence>
        {hasContributed && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-brand-blue text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-green/20 text-brand-green rounded-lg mt-0.5">
                <Rocket className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-sm text-slate-100">Nouvelle contribution simulée !</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  La jauge globale a été actualisée en temps réel. Merci de tester et d'explorer la plateforme de l'application !
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-16">
        
        {visibleSections.hero && (
          <> 
            {/* HERO SECTION / CAMPAGNE GAUGE SUMMARY */}
            <section id="hero" className="bg-slate-900 text-white pt-10 pb-16 px-4 md:px-6 relative overflow-hidden">
          
          {/* Subtle background circles */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[320px] h-[320px] bg-brand-green/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Vision Statement */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-semibold uppercase tracking-wider rounded-full border border-brand-green/20">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Projet d’Impact Social National</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-[1.12]">
                  Investissez dans l’avenir de l’éducation avec l’Application de suivi scolaire en temps réel.
                </h1>

                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light">
                  “Un projet innovant qui améliore la communication entre écoles et parents, réduit l’échec scolaire et garantit un suivi académique efficace.”
                </p>

                <div className="flex flex-wrap gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => showSection('solution')}
                    className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl transition-all text-sm block text-center"
                  >
                    Découvrir la solution
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                  <div>
                    <span className="block text-2xl font-black text-brand-green">100%</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Transparent &amp; Audit prévu</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">SMS + Web</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Zéro coupure réseau</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Campaign progress Card */}
              <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-xs border border-slate-850 p-6 rounded-3xl shadow-2xl relative">
                <div className="space-y-6">
                  
                  {/* Status Badges */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono">Simulateur Actif</span>
                  </div>

                  {/* Large Metrics */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 tracking-widest font-semibold block">Collecté</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black text-brand-green tracking-tight font-mono">
                        {formatFCFA(raisedAmount)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      sur un objectif total estimé de <strong>{formatFCFA(CAMPAGNE_GOAL)}</strong>
                    </span>
                    <div className="mt-3 rounded-3xl bg-slate-950/70 border border-slate-800 p-3 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Montant total de don collecté</span>
                        <div className="mt-1 text-xl font-bold text-white">{formatFCFA(150000)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Nombre de personnes ayant fait un don</span>
                        <div className="mt-1 text-xl font-bold text-white">4</div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progression globale</span>
                      <span className="text-brand-green font-mono">{percentage}% financé</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-brand-green h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Sub-campaign stats Grid */}
                  <div className="py-1.5 border-y border-slate-800/80">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-xl font-bold text-slate-100 font-mono">{backersCount}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Personnes ayant investi</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl md:text-3xl font-black text-yellow-300 font-mono">{formatFCFA(remainingAmount)}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Restant à collecter</span>
                      </div>
                    </div>
                  </div>

                  {/* Instant shortcut trigger */}
                  <div className="grid gap-3">
                    <button 
                      type="button"
                      onClick={() => showSection('investment')}
                      className="w-full py-3.5 bg-brand-green hover:bg-brand-green/95 text-slate-900 font-extrabold rounded-2xl text-lg transition-all shadow-md block text-center"
                    >
                      Investir dès maintenant
                    </button>
                    <button
                      type="button"
                      onClick={handleDonateClick}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl text-base transition-all shadow-md block text-center"
                    >
                      Faire un don
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </section>
          </>
        )}

        {/* SECTION 1: PRESENTATION DU PROBLEME */}
        {visibleSections.probleme && (
          <section id="probleme" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Photo content */}
              <div className="lg:col-span-5 relative group">
                {/* Background colored shadow box */}
                <div className="absolute -inset-4 bg-brand-blue/5 rounded-3xl -rotate-2 transform group-hover:rotate-0 transition-transform duration-300 pointer-events-none" />
                
                {/* Photo render */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                  <img 
                    src={classroomStudentsImage}
                    alt="Photo d'élèves africains attentifs et joyeux en classe"
                    className="w-full h-[320px] md:h-[400px] object-cover hover:scale-101 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Caption Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl text-white text-xs flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <p className="leading-snug">
                      La réactivité administrative en temps réel multiplie par deux le taux d'implication parentale.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Problem description */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">Le Constat Actuel</span>
                  <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                    Le manque de communication moderne nuit à l’excellence scolaire.
                  </h2>
                </div>

                {/* Problem quote requested */}
                <div className="bg-slate-50 border-l-4 border-slate-800 p-5 rounded-r-2xl">
                  <p className="text-slate-800 text-base italic leading-relaxed font-medium">
                    “Aujourd’hui, les parents découvrent trop tard les absences ou les mauvais résultats. La communication scolaire reste lente et inefficace.”
                  </p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  L'échec scolaire n'est souvent pas un problème de capacité, mais un problème de <strong className="text-brand-blue">latence d'information</strong>. Lorsqu'une absence n'est pas signalée immédiatement ou lorsqu'une mauvaise note de milieu de trimestre n'est vue par le parent qu'à la distribution des bulletins de fin d'année, il est trop tard pour réagir, organiser un soutien scolaire ou guider l’étudiant.
                </p>

                {/* Micro KPIs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg mt-0.5">
                      <span className="text-[10px] font-bold font-mono">92%</span>
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">Absence de plateforme en ligne</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">Pour la très grande majorité des établissements subsahariens.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg mt-0.5">
                      <span className="text-[10px] font-bold font-mono">15 Jrs+</span>
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">Délai moyen d'information</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">Pour déceler un décrochage, une absence répétée ou un incident disciplinaire.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>
        )}
        {visibleSections.solution && (
          <section id="solution" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            {/* Header Text */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block">Notre Solution</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Une application mobile et web qui connecte instantanément parents, enseignants et administration.
              </h2>
              <div className="w-12 h-1 bg-brand-green mx-auto rounded-full" />
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Notre plateforme fluidifie l’administration, allège la paperasse pour l’enseignant, et permet aux parents d'agir au jour le jour avec discernement.
              </p>
            </div>

            {/* Render interactive schema component (Parents <-> App <-> School) */}
            <InteractiveSchema />

            {/* Three key pillars description as requested */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5 text-brand-green font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full inline-block" />
                  📱 Suivi en temps réel
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dès l'instant ou la feuille de présence ou le bulletin est validé sur le portail enseignant, le parent reçoit une alerte push ou un SMS pour en être notifié.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-brand-blue font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full inline-block" />
                  👨‍👩‍👧 Implication parentale
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Le parent n'attend plus de devoir venir chercher les relevés de fin d'année. Il fait partie intégrante du quotidien et peut communiquer directement avec l'école.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-brand-green font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full inline-block" />
                  🎓 Réussite scolaire
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Les professeurs évaluent et renseignent plus facilement leurs rapports. La fluidité d'analyse permet de redresser les situations bien avant les examens décisifs.
                </p>
              </div>

            </div>

          </div>
        </section>
        )}

        {/* SECTION 3: POURQUOI INVESTIR ? */}
        {visibleSections.pourquoi && (
          <section id="pourquoi" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block">Opportunité</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Pourquoi investir dans ce projet innovant ?
              </h2>
              <div className="w-12 h-1 bg-brand-blue mx-auto rounded-full" />
              <p className="text-slate-600 text-sm leading-relaxed">
                Ce projet associe viabilité financière incontournable et changement social profond et mesurable pour l'éducation.
              </p>
            </div>

            {/* Strategic Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <PiggyBank className="w-6 h-6 text-brand-green" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Revenus garantis</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Grâce aux frais scolaires et d'inscriptions directement intégrés à la plateforme, l'application prélève de faibles redevances d'administration récurrentes garantissant des revenus prévisibles.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded w-fit uppercase">
                  SaaS Éducatif
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <TrendingUp className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Marché immense</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cible prioritairement toutes les écoles secondaires, privées. Un fort désir de numérisation de la part des parents d'élèves africains.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded w-fit uppercase">
                  Primaires &amp; Lycées
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Impact social fort</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Réduit drastiquement l’échec scolaire et l'absentéisme non encadré. Renforce la transparence et l'éthique au sein de l'environnement éducatif.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded w-fit uppercase">
                  RSE &amp; Éthique
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <Rocket className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Expansion en Afrique</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Un fort potentiel d’exportation et d’expansion rapide. Les technologies mobiles en Afrique de l'Ouest connaissent l’une des croissances les plus fulgurantes.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded w-fit uppercase">
                  Panafricain
                </div>
              </div>

            </div>

          </div>
        </section>
        )}

        {/* SECTION 3.5: TABLEAU FINANCIER D'INVESTISSEMENT */}
        {visibleSections.investment && (
          <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div id="investment" className="mb-12 text-center scroll-mt-24">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-2">Opportunité d'Investissement</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Rendement selon palier (jusqu'à 400%) en 5 ans
              </h2>
              <p className="text-slate-600 text-sm mt-3 max-w-2xl mx-auto">
                Découvrez les conditions de remboursement équitable et transparent selon le montant investi
              </p>
            </div>
            <InvestmentTable />
          </div>
        </section>
        )}

        {/* SECTION 4: BUDGET & OBJECTIFS DE COLLECTE */}
        {visibleSections.budget && (
          <section id="budget" className="py-20 bg-slate-50 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column Text / Campaign Details */}
              <div className="lg:col-span-4 space-y-5">
                <div>
                  <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-1">Ressources &amp; Transparence</span>
                  <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                    Un budget clair pour un déploiement maîtrisé
                  </h2>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  L'ensemble de la levée servira à propulser le développement de l'application, l'acquisition de serveurs locaux cloud sécurisés décisifs, et l'implantation territoriale par l'équipe de coordination du projet.
                </p>

                <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-emerald-500/10 text-emerald-800 p-3 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-green" />
                  <span>
                    Chaque contribution sera utilisée exclusivement pour le développement et le déploiement de l’application.
                  </span>
                </div>
              </div>

              {/* Right Column: Custom interactive donut chart component */}
              <div className="lg:col-span-8 space-y-8">
                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                  <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-2">Description de l'allocation</span>
                  <h3 className="text-2xl font-extrabold text-brand-blue tracking-tight">Développement Technique & QA</h3>
                </div>
                <BudgetChart />
              </div>

            </div>

          </div>
        </section>
        )}

        <SurveyResults
          parentsUtility={surveyParentUtility}
          parentsAdoption={surveyParentAdoption}
          establishmentsUtility={surveyEstablishmentUtility}
          establishmentsAdoption={surveyEstablishmentAdoption}
          establishmentsReluctant={surveyEstablishmentReluctant}
        />

        {/* SECTION 5: SYSTEME DE PALIER AVANT DETAIL DES INVESTISSEURS */}
        <section id="progress" className="scroll-mt-24 pt-10 pb-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-2">Palier de niveau débloqué</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">Système de paliers et d&apos;impact</h2>
              <p className="text-slate-600 text-sm mt-3 max-w-2xl mx-auto">
                Les différentes étapes de développement de l’application se débloquent à mesure que l&apos;objectif cumulé est atteint.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {tierProgress.map((value, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Palier {index + 1} : {value}%</span>
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full whitespace-nowrap ${getTierBadgeClass(value)}`}>
                      {getTierStatus(value)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{PALIER_DETAILS[index].title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{PALIER_DETAILS[index].description}</p>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: CONTACT & TRANSPARENCE */}
        {visibleSections.contact && (
          <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              
              {/* Left column info */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block mb-1">Directeur de projet</span>
                    <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                      Contact & Transparence
                    </h2>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    Porté par M. AYISSOU Koffi Elom, ce projet d'utilité publique répond à un cahier des charges rigide de rigueur et d’intégrité financière.
                  </p>
                </div>

                {/* Team coordinates panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-brand-blue text-sm">Coordonnées directes</h4>
                  
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-brand-green" />
                        <span>Porteur : <strong className="text-slate-900">AYISSOU Koffi Elom</strong></span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-brand-blue" />
                        <span>Tél : <strong className="text-slate-900">91 55 12 95</strong></span>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard('91551295', 'phone')}
                        className="text-slate-400 hover:text-brand-blue transition-colors"
                        title="Copier le numéro"
                      >
                        {copiedField === 'phone' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-blue" />
                        <span>Email : <strong className="text-slate-900">contact@ayissou-scolaire.tg</strong></span>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard('contact@ayissou-scolaire.tg', 'email')}
                        className="text-slate-400 hover:text-brand-blue transition-colors"
                        title="Copier l'email"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formal Engagement Pledge requested */}
                <div className="bg-brand-blue text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-brand-green uppercase tracking-wider font-bold">Engagement formel</span>
                  <p className="text-xs leading-relaxed text-slate-200">
                    “Chaque contribution sera utilisée exclusivement pour le développement et le déploiement de l’application.”
                  </p>
                </div>
              </div>

              {/* Right column contact dynamic forms */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-blue">Envoyer une question ou expression d’intérêt</h3>
                  <p className="text-xs text-slate-500">
                    Vous êtes investisseur qualifié et souhaitez discuter avec notre équipe ? Écrivez-nous directement.
                  </p>

                  {contactSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-5 rounded-xl text-xs space-y-1"
                    >
                      <h5 className="font-bold flex items-center gap-1 text-brand-green">
                        <Check className="w-4 h-4" /> Message envoyé avec succès !
                      </h5>
                      <p className="text-slate-600">
                        Merci pour votre message. Koffi Elom et son service de communication vous répondront dans un délai de 24 à 48 heures.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {contactError && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                          {contactError}
                        </div>
                      )}
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Mme/M. Adzo"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Email</label>
                          <input 
                            type="email" 
                            required
                            placeholder="adresse@exemple.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Votre message</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Bonjour Koffi, je suis commerçant à Lomé et j'aimerais investir dans votre projet dès maintenant..."
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-3 bg-brand-blue hover:bg-brand-blue/95 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {contactSubmitting ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-4 h-4 text-brand-green" />
                            <span>Envoyer ma requête sécurisée</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Constitution légale en cours d'enregistrement</span>
                  <span>Lomé, Togo</span>
                </div>
              </div>

            </div>

          </div>
        </section>
        )}

        {/* DYNAMIC CALL TO ACTION FINAL BANNER */}
        {showAnySection && (
          <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-brand-green border border-white/10">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin-slow" />
            </div>

            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 max-w-2xl mx-auto leading-relaxed">
              “Rejoignez-nous pour transformer l’éducation en Afrique. Votre investissement n’est pas seulement financier, il est social et durable.”
            </p>

          </div>
        </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-extrabold border border-slate-800">
              <span className="text-brand-green">E</span>T
            </div>
            <div>
              <span className="font-bold text-slate-300 text-sm block leading-none">Ecole Track Afrique</span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">© 2026 AYISSOU Koffi Elom. Tous Droits Réservés.</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>Données cryptées SSL</span>
            <span>•</span>
            <span>Simulateur Sandbox local</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

