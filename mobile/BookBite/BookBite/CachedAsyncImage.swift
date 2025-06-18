import SwiftUI
import Foundation

// MARK: - Image Cache Manager
class ImageCacheManager: ObservableObject {
    static let shared = ImageCacheManager()
    
    private var cache = NSCache<NSString, UIImage>()
    private var downloadTasks: [String: Task<UIImage?, Never>] = [:]
    private let taskQueue = DispatchQueue(label: "ImageCacheManager.taskQueue", attributes: .concurrent)
    
    private init() {
        // Configure cache
        cache.countLimit = 100 // Maximum number of images
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB memory limit
        
        // Listen for memory warnings
        NotificationCenter.default.addObserver(
            forName: UIApplication.didReceiveMemoryWarningNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.handleMemoryWarning()
        }
    }
    
    private func handleMemoryWarning() {
        // Clear half the cache on memory warning
        taskQueue.async(flags: .barrier) { [weak self] in
            self?.cache.removeAllObjects()
            self?.downloadTasks.removeAll()
        }
        print("🧹 Image cache cleared due to memory warning")
    }
    
    func getImage(from urlString: String) async -> UIImage? {
        // Validate URL first
        guard !urlString.isEmpty, URL(string: urlString) != nil else { 
            print("❌ Invalid URL string: \(urlString)")
            return nil 
        }
        
        let cacheKey = NSString(string: urlString)
        
        // Check if image is already cached
        if let cachedImage = cache.object(forKey: cacheKey) {
            return cachedImage
        }
        
        // Check if download is already in progress (thread-safe)
        let task = await withCheckedContinuation { continuation in
            taskQueue.async(flags: .barrier) { [weak self] in
                if let existingTask = self?.downloadTasks[urlString] {
                    continuation.resume(returning: existingTask)
                } else {
                    // Start new download task
                    let newTask = Task<UIImage?, Never> {
                        let image = await self?.downloadImage(from: urlString)
                        
                        // Remove task from dictionary when completed
                        self?.taskQueue.async(flags: .barrier) {
                            self?.downloadTasks.removeValue(forKey: urlString)
                        }
                        
                        return image
                    }
                    
                    self?.downloadTasks[urlString] = newTask
                    continuation.resume(returning: newTask)
                }
            }
        }
        
        return await task.value
    }
    
    private func downloadImage(from urlString: String) async -> UIImage? {
        guard let url = URL(string: urlString) else { 
            print("❌ Invalid URL: \(urlString)")
            return nil 
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            
            // Validate HTTP response
            if let httpResponse = response as? HTTPURLResponse {
                guard 200...299 ~= httpResponse.statusCode else {
                    print("❌ HTTP Error \(httpResponse.statusCode) for URL: \(urlString)")
                    return nil
                }
            }
            
            guard let image = UIImage(data: data) else {
                print("❌ Failed to create UIImage from data for URL: \(urlString)")
                return nil
            }
            
            // Cache the downloaded image
            let cacheKey = NSString(string: urlString)
            cache.setObject(image, forKey: cacheKey)
            
            return image
        } catch {
            print("❌ Failed to download image from \(urlString): \(error.localizedDescription)")
            return nil
        }
    }
    
    func clearCache() {
        taskQueue.async(flags: .barrier) { [weak self] in
            self?.cache.removeAllObjects()
            self?.downloadTasks.removeAll()
        }
    }
    
    func preloadImage(from urlString: String) {
        guard !urlString.isEmpty, URL(string: urlString) != nil else { return }
        
        Task {
            _ = await getImage(from: urlString)
        }
    }
    
    func getCacheStats() -> (count: Int, totalCost: Int) {
        return (count: cache.countLimit, totalCost: cache.totalCostLimit)
    }
    
    func getCurrentCacheUsage() -> (imageCount: Int, taskCount: Int) {
        var taskCount = 0
        taskQueue.sync {
            taskCount = downloadTasks.count
        }
        return (imageCount: cache.countLimit, taskCount: taskCount)
    }
    
    func printDebugInfo() {
        let usage = getCurrentCacheUsage()
        print("🔍 Cache Debug Info:")
        print("   - Cached images: \(usage.imageCount)")
        print("   - Active download tasks: \(usage.taskCount)")
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        // Cancel all pending tasks
        downloadTasks.values.forEach { $0.cancel() }
        downloadTasks.removeAll()
    }
}

// MARK: - Cached Async Image View
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    private let url: String?
    private let content: (Image) -> Content
    private let placeholder: () -> Placeholder
    
    @State private var image: UIImage?
    @State private var isLoading = false
    
    init(
        url: String?,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.content = content
        self.placeholder = placeholder
    }
    
    var body: some View {
        Group {
            if let image = image {
                content(Image(uiImage: image))
            } else {
                placeholder()
                    .onAppear {
                        loadImage()
                    }
                    .onChange(of: url) { newUrl in
                        // Reset state when URL changes
                        image = nil
                        isLoading = false
                        if newUrl != nil && !newUrl!.isEmpty {
                            loadImage()
                        }
                    }
            }
        }
    }
    
    private func loadImage() {
        guard let url = url, !url.isEmpty, !isLoading else { return }
        
        isLoading = true
        Task {
            let downloadedImage = await ImageCacheManager.shared.getImage(from: url)
            
            // Check if the view is still active and URL hasn't changed
            guard !Task.isCancelled else { return }
            
            await MainActor.run {
                // Only update if we're still loading the same URL
                if self.url == url {
                    self.image = downloadedImage
                    self.isLoading = false
                }
            }
        }
    }
}

// MARK: - Convenience Initializers
extension CachedAsyncImage where Content == Image, Placeholder == Color {
    init(url: String?) {
        self.init(
            url: url,
            content: { image in
                image
                    .resizable()
            },
            placeholder: {
                Color.gray.opacity(0.3)
            }
        )
    }
}

extension CachedAsyncImage where Placeholder == EmptyView {
    init(
        url: String?,
        @ViewBuilder content: @escaping (Image) -> Content
    ) {
        self.init(
            url: url,
            content: content,
            placeholder: { EmptyView() }
        )
    }
}

// MARK: - Restaurant Image View Component
struct RestaurantImageView: View {
    let imageUrl: String?
    let width: CGFloat?
    let height: CGFloat
    let cornerRadius: CGFloat
    
    init(imageUrl: String?, width: CGFloat? = nil, height: CGFloat, cornerRadius: CGFloat = 8) {
        self.imageUrl = imageUrl
        self.width = width
        self.height = height
        self.cornerRadius = cornerRadius
    }
    
    var body: some View {
        CachedAsyncImage(url: imageUrl) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: width, height: height)
                .clipped()
                .cornerRadius(cornerRadius)
        } placeholder: {
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: width, height: height)
                .cornerRadius(cornerRadius)
                .overlay(
                    VStack(spacing: 8) {
                        ProgressView()
                            .scaleEffect(0.8)
                        Image(systemName: "fork.knife")
                            .font(.system(size: 24))
                            .foregroundColor(.gray)
                    }
                )
        }
    }
}

// MARK: - Circular Restaurant Image (for smaller displays)
struct CircularRestaurantImageView: View {
    let imageUrl: String?
    let size: CGFloat
    
    init(imageUrl: String?, size: CGFloat = 50) {
        self.imageUrl = imageUrl
        self.size = size
    }
    
    var body: some View {
        CachedAsyncImage(url: imageUrl) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: size, height: size)
                .clipShape(Circle())
        } placeholder: {
            Circle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: size, height: size)
                .overlay(
                    ProgressView()
                        .scaleEffect(0.6)
                )
        }
    }
}
