import React, { useState } from 'react';
import {
  Building,
  MapPin,
  ListCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  Star,
  Trash2,
  ArrowRight,
  ArrowLeft,
  HardDrive,
  Sparkles,
  Info,
} from 'lucide-react';
import { Property, PropertyImage, PropertyType, FurnishedStatus } from '../../types';
import { useSafeNestStore } from '../../lib/store';
import { uploadFileToDrive } from '../../lib/drive';

interface PropertyUploadFormProps {
  onSuccess: (property: Property) => void;
  onCancel: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Modern Living Room',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    resolution: '1920x1080',
    fileSize: '2.4 MB',
  },
  {
    name: 'Master Suite Bedroom',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    resolution: '1920x1280',
    fileSize: '1.9 MB',
  },
  {
    name: 'Fitted Kitchen & Dining',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    resolution: '2048x1365',
    fileSize: '3.1 MB',
  },
  {
    name: 'Luxury Bathroom',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    resolution: '1800x1200',
    fileSize: '1.7 MB',
  },
  {
    name: 'Patio & Scenic View',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    resolution: '1920x1080',
    fileSize: '2.1 MB',
  },
];

const UGANDAN_AMENITIES_OPTIONS = [
  'High-speed Fiber WiFi',
  'Standby Generator & Solar Inverter',
  '24/7 Security & CCTV',
  'NWSC Water + 10,000L Reserve Tank',
  'Swimming Pool',
  'Gym & Fitness Studio',
  'Landscaped Garden',
  'Balcony with Ridge View',
  'Dedicated Paved Parking',
  'Air Conditioning',
  'Elevator Access',
  'Staff Quarters (DSQ)',
  'Electric Perimeter Fence',
];

export const PropertyUploadForm: React.FC<PropertyUploadFormProps> = ({ onSuccess, onCancel }) => {
  const store = useSafeNestStore();
  const isAdmin = store.currentUser.role === 'super_admin';

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [rentAmount, setRentAmount] = useState<number>(2500000);
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [securityDeposit, setSecurityDeposit] = useState<number>(2500000);
  const [availableDate, setAvailableDate] = useState('2026-10-01');

  // Inspection Pricing
  const [inspectionPriceVirtual, setInspectionPriceVirtual] = useState<number>(5000);
  const [inspectionPriceInPerson, setInspectionPriceInPerson] = useState<number>(10000);
  const [inspectionPricePremium, setInspectionPricePremium] = useState<number | undefined>(undefined);

  // Step 2: Location
  const [address, setAddress] = useState('Plot 24, Acacia Avenue');
  const [city, setCity] = useState('Kampala');
  const [neighborhood, setNeighborhood] = useState('Kololo');
  const [stateRegion, setStateRegion] = useState('Central');

  // Step 3: Specs
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [squareFeet, setSquareFeet] = useState<number>(1200);
  const [floorNumber, setFloorNumber] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(2);
  const [furnished, setFurnished] = useState<FurnishedStatus>('yes');
  const [amenities, setAmenities] = useState<string[]>([
    'High-speed Fiber WiFi',
    'Standby Generator & Solar Inverter',
    '24/7 Security & CCTV',
    'NWSC Water + 10,000L Reserve Tank',
    'Balcony with Ridge View',
    'Dedicated Paved Parking',
  ]);

  // Step 4: Photos
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [images, setImages] = useState<PropertyImage[]>([
    {
      id: 'temp_img_1',
      propertyId: '',
      url: SAMPLE_PHOTO_PRESETS[0].url,
      isMain: true,
      sortOrder: 1,
      status: isAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      resolution: SAMPLE_PHOTO_PRESETS[0].resolution,
      fileSize: SAMPLE_PHOTO_PRESETS[0].fileSize,
    },
    {
      id: 'temp_img_2',
      propertyId: '',
      url: SAMPLE_PHOTO_PRESETS[1].url,
      isMain: false,
      sortOrder: 2,
      status: isAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      resolution: SAMPLE_PHOTO_PRESETS[1].resolution,
      fileSize: SAMPLE_PHOTO_PRESETS[1].fileSize,
    },
    {
      id: 'temp_img_3',
      propertyId: '',
      url: SAMPLE_PHOTO_PRESETS[2].url,
      isMain: false,
      sortOrder: 3,
      status: isAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      resolution: SAMPLE_PHOTO_PRESETS[2].resolution,
      fileSize: SAMPLE_PHOTO_PRESETS[2].fileSize,
    },
  ]);

  const [syncToGoogleDrive, setSyncToGoogleDrive] = useState(false);

  // Validation
  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 1) {
      if (!title.trim() || title.length < 5) {
        setError('Please provide a descriptive title (at least 5 characters).');
        return false;
      }
      if (!description.trim() || description.length < 20) {
        setError('Please provide a property description (at least 20 characters).');
        return false;
      }
      if (!rentAmount || rentAmount <= 0) {
        setError('Rent amount must be a positive number.');
        return false;
      }
      if (!inspectionPriceInPerson || inspectionPriceInPerson <= 0) {
        setError('In-Person Visit Price is required and must be a positive amount.');
        return false;
      }
    } else if (s === 2) {
      if (!address.trim() || !city.trim() || !neighborhood.trim()) {
        setError('Please provide a complete street address, neighborhood, and city in Uganda.');
        return false;
      }
    } else if (s === 3) {
      if (bedrooms < 0 || bathrooms < 0) {
        setError('Bedrooms and bathrooms must be positive numbers.');
        return false;
      }
    } else if (s === 4) {
      if (images.length < 2) {
        setError('Please upload at least 2 high-quality photos (up to 20 images supported).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleAddSamplePhoto = (preset: (typeof SAMPLE_PHOTO_PRESETS)[0]) => {
    if (images.length >= 20) {
      setError('Maximum 20 photos per property.');
      return;
    }
    const newImg: PropertyImage = {
      id: `img_new_${Date.now()}_${images.length + 1}`,
      propertyId: '',
      url: preset.url,
      isMain: images.length === 0,
      sortOrder: images.length + 1,
      status: isAdmin ? 'approved' : 'pending',
      resolution: preset.resolution,
      fileSize: preset.fileSize,
      createdAt: new Date().toISOString(),
    };
    setImages([...images, newImg]);
  };

  const handleAddCustomPhotoUrl = () => {
    if (!customPhotoUrl.trim()) return;
    if (images.length >= 20) {
      setError('Maximum 20 photos allowed.');
      return;
    }
    const newImg: PropertyImage = {
      id: `img_custom_${Date.now()}`,
      propertyId: '',
      url: customPhotoUrl.trim(),
      isMain: images.length === 0,
      sortOrder: images.length + 1,
      status: isAdmin ? 'approved' : 'pending',
      resolution: '1920x1080',
      fileSize: '2.0 MB',
      createdAt: new Date().toISOString(),
    };
    setImages([...images, newImg]);
    setCustomPhotoUrl('');
  };

  const handleSetMainPhoto = (id: string) => {
    setImages(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  const handleDeletePhoto = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
      filtered[0].isMain = true;
    }
    setImages(filtered);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 20) {
      setError('Maximum 20 photos allowed.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../lib/firebase');

      // Create storage reference
      const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
      
      // Upload file bytes
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const newImg: PropertyImage = {
        id: `img_storage_${Date.now()}`,
        propertyId: '',
        url: downloadUrl,
        isMain: images.length === 0,
        sortOrder: images.length + 1,
        status: isAdmin ? 'approved' : 'pending',
        resolution: 'Uploaded File',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        createdAt: new Date().toISOString(),
      };

      setImages([...images, newImg]);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to upload to Firebase Storage: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      // If user enabled Google Drive backup and is authenticated, save record to Drive
      let driveDocName: string | undefined;
      let driveDocLink: string | undefined;

      if (syncToGoogleDrive && store.googleAccessToken) {
        try {
          const docContent = `SafeNest Property Record\n======================\nTitle: ${title}\nLocation: ${address}, ${neighborhood}, ${city}\nRent: ${currency} ${rentAmount.toLocaleString()}\nBedrooms: ${bedrooms} | Bathrooms: ${bathrooms}\nLandlord: ${store.currentUser.fullName}\nUploaded: ${new Date().toLocaleString()}\n`;
          const driveItem = await uploadFileToDrive(
            store.googleAccessToken,
            `SafeNest_Listing_${title.replace(/\s+/g, '_').slice(0, 20)}.txt`,
            'text/plain',
            docContent
          );
          store.addGoogleDriveFile(driveItem);
          driveDocName = driveItem.name;
          driveDocLink = driveItem.webViewLink;
        } catch (e) {
          console.warn('Google Drive sync non-fatal warning:', e);
        }
      }

      const created = store.addProperty({
        landlordId: store.currentUser.id,
        landlordName: store.currentUser.fullName,
        landlordPhone: store.currentUser.phone,
        landlordEmail: store.currentUser.email,
        landlordVerified: store.currentUser.isVerified,
        createdBy: store.currentUser.id,
        title,
        description,
        propertyType,
        rentAmount,
        currency,
        securityDeposit,
        availableDate,
        address,
        city,
        neighborhood,
        stateRegion,
        bedrooms,
        bathrooms,
        squareFeet,
        floorNumber,
        parkingSpaces,
        furnished,
        amenities,
        images,
        isFeatured: false,
        status: isAdmin ? 'published' : 'pending',
        driveDocumentName: driveDocName,
        driveDocumentLink: driveDocLink,
        inspectionPriceVirtual,
        inspectionPriceInPerson,
        inspectionPricePremium,
      });

      onSuccess(created);
    } catch (err: any) {
      setError(err.message || 'Failed to submit property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
              {isAdmin ? 'Admin Property Portal' : 'Landlord Property Upload'}
            </span>
            {!isAdmin && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Photos require Admin Moderation before publishing
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Upload New Rental Property</h2>
          <p className="text-xs text-slate-500">
            List high-quality residential and commercial rental units in Uganda.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1 px-3 border border-slate-200 rounded-lg"
        >
          Cancel
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Location' },
          { num: 3, label: 'Specs & Amenities' },
          { num: 4, label: 'Photos & Review' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                : step > s.num
                ? 'bg-slate-50 border-emerald-200 text-emerald-700 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
            }`}
          >
            <span className="text-xs block">Step {s.num}</span>
            <span className="text-[11px] truncate block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Property Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Modern 2-Bedroom Luxury Suite with Kololo Hill View"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Property Type *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden capitalize"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Villa / Standalone Mansion</option>
                <option value="house">Residential House</option>
                <option value="studio">Studio Flat</option>
                <option value="commercial">Commercial Office / Space</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Monthly Rent *
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-bold"
                >
                  <option value="UGX">UGX (USh)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(parseInt(e.target.value, 10) || 0)}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Security Deposit
              </label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Available Move-in Date
              </label>
              <input
                type="date"
                value={availableDate}
                onChange={(e) => setAvailableDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              placeholder="Highlight proximity to shopping malls, diplomatic zones, paved access roads, water tanks, backup power, and security features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
            />
          </div>

          {/* Inspection Pricing Section */}
          <div className="border-t border-slate-100 pt-5 mt-5">
            <h3 className="text-sm font-black text-slate-900 mb-1">
              Inspection Pricing
            </h3>
            <div className="flex items-start gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Users pay these amounts directly to the agent. SafeNest does not process payments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Virtual Tour Price (UGX)
                </label>
                <input
                  type="number"
                  value={inspectionPriceVirtual}
                  onChange={(e) => setInspectionPriceVirtual(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-semibold text-slate-700 bg-slate-50"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  In-Person Visit Price (UGX) *
                </label>
                <input
                  type="number"
                  value={inspectionPriceInPerson}
                  onChange={(e) => setInspectionPriceInPerson(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-semibold"
                  placeholder="e.g. 15000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Premium Price (UGX)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="number"
                  value={inspectionPricePremium ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setInspectionPricePremium(isNaN(val) ? undefined : val);
                  }}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-semibold"
                  placeholder="e.g. 25000"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">City / Town *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-medium"
              >
                <option value="Kampala">Kampala</option>
                <option value="Entebbe">Entebbe</option>
                <option value="Jinja">Jinja</option>
                <option value="Wakiso">Wakiso</option>
                <option value="Mukono">Mukono</option>
                <option value="Mbarara">Mbarara</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Neighborhood / Division *
              </label>
              <input
                type="text"
                placeholder="e.g. Kololo, Nakasero, Naguru, Ntinda, Bugolobi, Muyenga, Manyago"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Physical Street Address / Plot Number *
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 14, Prince Charles Drive"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold">Uganda Geocoding Coordinates:</span>
              <p className="text-emerald-800">
                Lat: 0.3475, Long: 32.6102 (SafeNest geocodes verified Kampala & Entebbe neighborhoods automatically).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Specs & Amenities */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Bathrooms</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Square Feet</label>
              <input
                type="number"
                value={squareFeet}
                onChange={(e) => setSquareFeet(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Parking Slots</label>
              <input
                type="number"
                min="0"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Furnishing Status</label>
            <div className="flex gap-2">
              {[
                { id: 'yes', label: 'Fully Furnished' },
                { id: 'partial', label: 'Semi-Furnished' },
                { id: 'no', label: 'Unfurnished' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFurnished(f.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    furnished === f.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Amenities & Infrastructure
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UGANDAN_AMENITIES_OPTIONS.map((item) => {
                const isChecked = amenities.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAmenity(item)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Photos & Review */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Property Photos ({images.length}/20 uploaded)
              </label>
              <span className="text-[11px] text-slate-500">
                Click star on photo to set as primary thumbnail
              </span>
            </div>

            {/* Quick Add Presets (Simulates photo selection) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick-Add High-Res Property Photos:
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddSamplePhoto(preset)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>

              {/* Custom Image URL input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPhotoUrl}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {/* Firebase Storage File Upload */}
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photos to Firebase Cloud Storage:
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalFileUpload}
                    disabled={isUploading}
                    className="block w-full text-xs text-slate-500
                      file:mr-4 file:py-1.5 file:px-3
                      file:rounded-lg file:border-0
                      file:text-xs file:font-semibold
                      file:bg-emerald-600 file:text-white
                      hover:file:bg-emerald-500
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isUploading && (
                    <span className="text-xs text-emerald-600 font-bold animate-pulse">
                      Uploading...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 group bg-slate-100 ${
                    img.isMain ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />

                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    {img.isMain && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">
                        Main
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-slate-900/80 text-white text-[9px] rounded">
                      {img.fileSize || '2 MB'}
                    </span>
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetMainPhoto(img.id)}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-emerald-700"
                      title="Set as Main Photo"
                    >
                      <Star className={`w-4 h-4 ${img.isMain ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(img.id)}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-rose-600"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Drive Vault Sync Option */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToGoogleDrive}
                onChange={(e) => setSyncToGoogleDrive(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  Backup Property Record & Tenancy Agreement to Google Drive
                </span>
                <p className="text-[11px] text-slate-500">
                  Automatically create and archive a certified rental docket in your SafeNest Google Drive vault.
                </p>
              </div>
            </label>
          </div>

          {/* Review Card */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-2">
            <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Submission Summary:
            </h4>
            <p>
              <strong>{title || 'Untitled Property'}</strong> in{' '}
              <strong>
                {neighborhood}, {city}
              </strong>
            </p>
            <p>
              Rent: <strong>{currency} {rentAmount.toLocaleString()} / mo</strong> · {bedrooms} Beds · {bathrooms} Baths · {images.length} Photos
            </p>
            {!isAdmin ? (
              <p className="text-amber-800 font-medium">
                Note: Upon submission, this listing will enter the Admin Photo Moderation Queue. The platform administrator will verify all photos before it is published on the public marketplace.
              </p>
            ) : (
              <p className="text-emerald-800 font-medium">
                Administrator Action: Listing will be immediately published to the live SafeNest marketplace.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors"
          >
            Continue to Step {step + 1}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors"
          >
            {isSubmitting ? (
              'Submitting Property...'
            ) : isAdmin ? (
              'Publish Property Immediately'
            ) : (
              'Submit for Admin Photo Moderation'
            )}
          </button>
        )}
      </div>
    </div>
  );
};
