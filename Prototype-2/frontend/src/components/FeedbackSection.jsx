import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { api } from '../api/client';

const FeedbackSection = ({ selectedSite }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch existing feedback
  const { data: feedbackData } = useQuery({
    queryKey: ['feedback', selectedSite],
    queryFn: () => api.getFeedback(selectedSite, 20),
  });

  // Submit feedback mutation
  const submitMutation = useMutation({
    mutationFn: (feedback) => api.submitFeedback(feedback),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedback', selectedSite]);
      setSelectedFeeling('');
      setComment('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const feelings = [
    { value: 'fresh', emoji: '😊', label: t('fresh'), color: 'bg-green-100 dark:bg-green-900' },
    { value: 'normal', emoji: '😐', label: t('normal'), color: 'bg-blue-100 dark:bg-blue-900' },
    { value: 'dusty', emoji: '😷', label: t('dusty'), color: 'bg-yellow-100 dark:bg-yellow-900' },
    { value: 'smoky', emoji: '😤', label: t('smoky'), color: 'bg-red-100 dark:bg-red-900' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFeeling) return;

    submitMutation.mutate({
      site: selectedSite,
      feeling: selectedFeeling,
      description: comment || null,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        {t('communityFeedback')}
      </h2>

      {/* Submit Feedback Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('howAirFeels')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {feelings.map((feeling) => (
              <button
                key={feeling.value}
                type="button"
                onClick={() => setSelectedFeeling(feeling.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 
                  ${selectedFeeling === feeling.value
                    ? 'border-blue-500 ' + feeling.color
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
              >
                <div className="text-3xl mb-2">{feeling.emoji}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feeling.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('addComment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('Air your thoughts here')}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedFeeling || submitMutation.isLoading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   text-white rounded-lg font-medium flex items-center justify-center gap-2
                   transition-colors duration-200"
        >
          <Send className="w-4 h-4" />
          {submitMutation.isLoading ? t('submitting') : t('submit')}
        </button>

        {showSuccess && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                        rounded-lg flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            {t('feedbackSuccess')}
          </div>
        )}
      </form>

      {/* Display Recent Feedback */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Recent Reports')}
        </h3>
        
        {feedbackData?.data?.feedback?.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedbackData.data.feedback.map((item) => {
              const feeling = feelings.find(f => f.value === item.feeling);
              return (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{feeling?.emoji || '😐'}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t('Site')} {item.site} - {feeling?.label || item.feeling}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('noFeedback')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;