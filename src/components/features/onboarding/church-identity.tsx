import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/ui/typography/Heading';
import { Span, Text } from '@/components/ui/typography/Text';
import { UseFormReturn } from 'react-hook-form';
import { ChurchIdentityValues } from '@/types/type';
import { Info } from 'lucide-react';

type ChurchIdentityStepProps = {
  form: UseFormReturn<ChurchIdentityValues>;
  onSubmit: (data: ChurchIdentityValues) => void;
  onSkip: () => void;
  step?: number;
  totalSteps?: number;
};

export function ChurchIdentityStep({ form, onSubmit, onSkip, step = 1, totalSteps = 3 }: ChurchIdentityStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={1} className="mb-2">Church Identity</Heading>
        <Text variant="muted">Tell us a little about your church.</Text>
      </div>

      <Form {...form}>
        <div onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="churchName" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Church Name <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Living Grace Ministries"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              control={form.control} 
              name="churchAlias" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Church Alias
                    <div className="relative group">
                      <Info className="h-3.5 w-3.5 text-primary-500 cursor-help" />
                      <Span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-primary-500 text-white-600 rounded shadow-lg z-10">
                        A short or alternative name your church is commonly known by
                      </Span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Living Grace"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>

          <FormField 
            control={form.control} 
            name="churchAddress" 
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Church Address <Span variant="error">*</Span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Street address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="country" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Country <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger >
                        <SelectValue placeholder="Nigeria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              control={form.control} 
              name="stateProvince" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State / Province <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="State"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="defaultCurrency" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Default Currency <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="₦ NGN" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">₦ Nigrian Naira</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              control={form.control} 
              name="timeZone" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Time Zone <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="(GMT+1) West Africa Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT+1">(GMT+1) West Africa Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>

          <FormField 
            control={form.control} 
            name="churchLogo" 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Church Logo</FormLabel>
                <FormControl>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-white hover:border-gray-300 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Text className="muted">Click to upload logo</Text>
                    </div>
                    <Input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />

          <div className="text-center mb-4">
            <Text variant="muted">
              Step <Span variant="default">{step}</Span> of {totalSteps}
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSkip}
              className="w-full order-2 md:order-1"
            >
              Save & Go to Dashboard
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
              className="w-full order-1 md:order-2 "
              variant="default"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}