import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const base = 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4';
    
    const variants = {
      default: 'bg-gray-800 border-gray-700 text-gray-100',
      destructive: 'bg-red-500/10 border-red-500 text-red-400 [&>svg]:text-red-400',
      success: 'bg-green-500/10 border-green-500 text-green-400 [&>svg]:text-green-400',
      warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400 [&>svg]:text-yellow-400',
    } as const;

    return (
      <div 
        ref={ref} 
        role="alert" 
        className={cn(base, variants[variant], className)} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('text-sm [&_p]:leading-relaxed', className)} 
      {...props} 
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';