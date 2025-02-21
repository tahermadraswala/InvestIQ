import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Building, CreditCard, Shield, 
  AlertCircle, DollarSign, Loader2 
} from 'lucide-react';

const FinancialProfileForm = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    
    // Employment Details
    employment_status: '',
    employer_name: '',
    job_title: '',
    annual_income: '',
    
    // Financial Information
    bank_name: '',
    account_type: '',
    net_worth: '',
    tax_filing_status: '',
    
    // Investment Profile
    investment_experience: '',
    risk_tolerance: '',
    investment_goals: '',
    investment_timeline: '',
    
    // Security Information
    id_type: '',
    id_number: '',
    tax_id_number: ''
  });

  useEffect(() => {
    // Load draft from localStorage if exists
    const savedDraft = localStorage.getItem('financialProfileDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored",
        });
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  const sections = {
    personal: 'Personal Information',
    employment: 'Employment Details',
    financial: 'Financial Information',
    investment: 'Investment Profile',
    security: 'Security & Verification'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const validateForm = () => {
    const requiredFields = {
      personal: ['full_name', 'email', 'phone'],
      employment: ['employment_status'],
      financial: ['account_type'],
      investment: ['investment_experience', 'risk_tolerance'],
      security: ['id_type', 'id_number']
    };

    const currentRequiredFields = requiredFields[activeSection];
    const missingFields = currentRequiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5015/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Profile saved successfully",
        });
        localStorage.removeItem('financialProfileDraft'); // Clear draft after successful submission
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message || "Failed to save profile");
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('financialProfileDraft', JSON.stringify(formData));
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved locally",
    });
  };

  const renderInput = (name, label, type = "text", options = null, required = false) => {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20";
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={baseClasses}
            required={required}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={baseClasses}
            placeholder={`Enter ${label.toLowerCase()}`}
            required={required}
          />
        )}
      </div>
    );
  };

  const renderSection = (section) => {
    switch (section) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('full_name', 'Full Name', 'text', null, true)}
            {renderInput('date_of_birth', 'Date of Birth', 'date')}
            {renderInput('email', 'Email Address', 'email', null, true)}
            {renderInput('phone', 'Phone Number', 'tel', null, true)}
            {renderInput('address', 'Address')}
            {renderInput('country', 'Country of Residence', 'select', [
              { value: 'US', label: 'United States' },
              { value: 'UK', label: 'United Kingdom' },
              { value: 'CA', label: 'Canada' },
              { value: 'AU', label: 'Australia' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
              { value: 'JP', label: 'Japan' }
            ])}
          </div>
        );

      case 'employment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('employment_status', 'Employment Status', 'select', [
              { value: 'employed', label: 'Employed' },
              { value: 'self-employed', label: 'Self-Employed' },
              { value: 'retired', label: 'Retired' },
              { value: 'student', label: 'Student' },
              { value: 'unemployed', label: 'Unemployed' }
            ], true)}
            {renderInput('employer_name', 'Employer Name')}
            {renderInput('job_title', 'Job Title')}
            {renderInput('annual_income', 'Annual Income', 'number')}
          </div>
        );

      case 'financial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('bank_name', 'Bank Name')}
            {renderInput('account_type', 'Account Type', 'select', [
              { value: 'checking', label: 'Checking' },
              { value: 'savings', label: 'Savings' },
              { value: 'investment', label: 'Investment' },
              { value: 'retirement', label: 'Retirement' }
            ], true)}
            {renderInput('net_worth', 'Net Worth', 'number')}
            {renderInput('tax_filing_status', 'Tax Filing Status', 'select', [
              { value: 'single', label: 'Single' },
              { value: 'married_joint', label: 'Married Filing Jointly' },
              { value: 'married_separate', label: 'Married Filing Separately' },
              { value: 'head', label: 'Head of Household' }
            ])}
          </div>
        );

      case 'investment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('investment_experience', 'Investment Experience', 'select', [
              { value: 'none', label: 'None' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' }
            ], true)}
            {renderInput('risk_tolerance', 'Risk Tolerance', 'select', [
              { value: 'conservative', label: 'Conservative' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'aggressive', label: 'Aggressive' }
            ], true)}
            {renderInput('investment_goals', 'Investment Goals', 'select', [
              { value: 'growth', label: 'Capital Growth' },
              { value: 'income', label: 'Regular Income' },
              { value: 'preservation', label: 'Wealth Preservation' },
              { value: 'speculation', label: 'Speculation' }
            ])}
            {renderInput('investment_timeline', 'Investment Timeline', 'select', [
              { value: 'short', label: 'Short Term (< 3 years)' },
              { value: 'medium', label: 'Medium Term (3-7 years)' },
              { value: 'long', label: 'Long Term (> 7 years)' }
            ])}
          </div>
        );

      case 'security':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('id_type', 'ID Type', 'select', [
              { value: 'passport', label: 'Passport' },
              { value: 'driver', label: "Driver's License" },
              { value: 'national', label: 'National ID' }
            ], true)}
            {renderInput('id_number', 'ID Number', 'text', null, true)}
            {renderInput('tax_id_number', 'Tax ID Number')}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="h-48 bg-gradient-to-r from-primary to-primary/80 rounded-t-lg flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Complete Your Financial Profile</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(sections).map(([key, label]) => (
            <Button
              key={key}
              variant={activeSection === key ? "default" : "ghost"}
              onClick={() => setActiveSection(key)}
              className="whitespace-nowrap"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Sections */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeSection === 'personal' && <User className="h-5 w-5" />}
                {activeSection === 'employment' && <Briefcase className="h-5 w-5" />}
                {activeSection === 'financial' && <Building className="h-5 w-5" />}
                {activeSection === 'investment' && <DollarSign className="h-5 w-5" />}
                {activeSection === 'security' && <Shield className="h-5 w-5" />}
                {sections[activeSection]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSection(activeSection)}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => {
                  const sections = ['personal', 'employment', 'financial', 'investment', 'security'];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(sections[currentIndex - 1]);
                  }
                }}
                disabled={activeSection === 'personal'}
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  const sections = ['personal', 'employment', 'financial', 'investment', 'security'];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : activeSection === 'security' ? (
                  'Submit Profile'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProfileForm;