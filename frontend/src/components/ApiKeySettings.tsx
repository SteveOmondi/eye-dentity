import { useState, useEffect } from 'react';
import { apiKeyApi, type ApiKeyData } from '../api/apiKeys';

interface ApiKeySettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeySettings = ({ isOpen, onClose }: ApiKeySettingsProps) => {
    const [provider, setProvider] = useState<'claude' | 'openai' | 'gemini'>('gemini');
    const [apiKey, setApiKey] = useState('');
    const [usePlatformKeys, setUsePlatformKeys] = useState(true);
    const [savedKeys, setSavedKeys] = useState<ApiKeyData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadSavedKeys();
        }
    }, [isOpen]);

    const loadSavedKeys = async () => {
        try {
            const keys = await apiKeyApi.getApiKeys();
            setSavedKeys(keys);
            setUsePlatformKeys(keys.length === 0);
        } catch (err: any) {
            console.error('Failed to load API keys:', err);
        }
    };

    const handleTestKey = async () => {
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        setError(null);

        try {
            const isValid = await apiKeyApi.testApiKey(provider, apiKey);
            setTestResult({
                success: isValid,
                message: isValid ? 'API key is valid!' : 'API key is invalid',
            });
        } catch (err: any) {
            setTestResult({
                success: false,
                message: err.message || 'Failed to test API key',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveKey = async () => {
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await apiKeyApi.saveApiKey(provider, apiKey);
            setApiKey('');
            setTestResult(null);
            await loadSavedKeys();
            setUsePlatformKeys(false);
        } catch (err: any) {
            setError(err.message || 'Failed to save API key');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteKey = async (keyProvider: string) => {
        if (!confirm(`Delete ${keyProvider} API key?`)) return;

        try {
            await apiKeyApi.deleteApiKey(keyProvider);
            await loadSavedKeys();
        } catch (err: any) {
            setError(err.message || 'Failed to delete API key');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <h2 className="text-2xl font-bold">API Key Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Mode Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Choose LLM Provider Mode
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    checked={usePlatformKeys}
                                    onChange={() => setUsePlatformKeys(true)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Use Platform Keys (Free)</div>
                                    <div className="text-sm text-gray-500">
                                        Use our API keys at no additional cost
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    checked={!usePlatformKeys}
                                    onChange={() => setUsePlatformKeys(false)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Use My Own Keys</div>
                                    <div className="text-sm text-gray-500">
                                        Use your own API keys for full control
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Add New Key */}
                    {!usePlatformKeys && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add API Key</h3>

                            <div className="space-y-4">
                                {/* Provider Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Provider
                                    </label>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="gemini">Gemini (Google)</option>
                                        <option value="claude">Claude (Anthropic)</option>
                                        <option value="openai">OpenAI (GPT-4)</option>
                                    </select>
                                </div>

                                {/* API Key Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter your API key..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                </div>

                                {/* Test Result */}
                                {testResult && (
                                    <div
                                        className={`px-4 py-3 rounded-lg ${testResult.success
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}
                                    >
                                        {testResult.success ? '✓' : '✗'} {testResult.message}
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleTestKey}
                                        disabled={isTesting || !apiKey.trim()}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {isTesting ? 'Testing...' : 'Test Connection'}
                                    </button>
                                    <button
                                        onClick={handleSaveKey}
                                        disabled={isLoading || !apiKey.trim() || (testResult ? !testResult.success : false)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Key'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saved Keys */}
                    {savedKeys.length > 0 && (
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved API Keys</h3>
                            <div className="space-y-3">
                                {savedKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 capitalize">
                                                {key.provider}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {key.isActive ? (
                                                    <span className="text-green-600">● Active</span>
                                                ) : (
                                                    <span className="text-gray-400">● Inactive</span>
                                                )}
                                                {' • '}
                                                Used {key.usageCount} times
                                                {key.lastUsed && (
                                                    <> • Last used {new Date(key.lastUsed).toLocaleDateString()}</>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteKey(key.provider)}
                                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
