// frontend/src/components/Alert.jsx
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  const configs = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`${config.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`${config.textColor} text-sm`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.textColor} hover:opacity-70 flex-shrink-0`}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}