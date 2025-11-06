/**
 * API Helper với Fallback Mechanism
 * Tự động chuyển sang mock data khi backend không khả dụng
 */

export const apiCallWithFallback = async (apiCall, mockFallback) => {
    try {
        return await apiCall();
    } catch (error) {
        console.warn('⚠️ API failed, using mock data:', error.message);

        // Optional: Show network error banner
        if (import.meta.env.VITE_SHOW_NETWORK_ERRORS === 'true') {
            showNetworkError();
        }

        return await mockFallback();
    }
};

export const showNetworkError = () => {
    // Check if banner already exists
    if (document.getElementById('network-error-banner')) {
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'network-error-banner';
    banner.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50 max-w-md';
    banner.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <div class="flex-1">
        <p class="font-semibold text-sm">Không thể kết nối đến máy chủ</p>
        <p class="text-xs mt-1">Dữ liệu hiển thị có thể không phải mới nhất</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200 text-xl leading-none">
        ×
      </button>
    </div>
  `;

    document.body.appendChild(banner);

    // Auto remove sau 5 giây
    setTimeout(() => {
        if (banner.parentElement) {
            banner.remove();
        }
    }, 5000);
};
