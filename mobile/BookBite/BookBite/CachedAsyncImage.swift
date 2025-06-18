import SwiftUI
import Foundation

// MARK: - Image Cache Manager
class ImageCacheManager: ObservableObject {
    static let shared = ImageCacheManager()
    
    private var cache = NSCache<NSString, UIImage>()
    private var downloadTasks: [String: Task<UIImage?, Never>] = [:]
    
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
        cache.removeAllObjects()
        print("🧹 Image cache cleared due to memory warning")
    }
    
    func getImage(from urlString: String) async -> UIImage? {
        let cacheKey = NSString(string: urlString)
        
        // Check if image is already cached
        if let cachedImage = cache.object(forKey: cacheKey) {
            return cachedImage
        }
        
        // Check if download is already in progress
        if let existingTask = downloadTasks[urlString] {
            return await existingTask.value
        }
        
        // Start new download task
        let task = Task<UIImage?, Never> {
            await downloadImage(from: urlString)
        }
        
        downloadTasks[urlString] = task
        let image = await task.value
        downloadTasks.removeValue(forKey: urlString)
        
        // Cache the downloaded image
        if let image = image {
            cache.setObject(image, forKey: cacheKey)
        }
        
        return image
    }
    
    private func downloadImage(from urlString: String) async -> UIImage? {
        guard let url = URL(string: urlString) else { return nil }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return UIImage(data: data)
        } catch {
            print("Failed to download image: \(error)")
            return nil
        }
    }
    
    func clearCache() {
        cache.removeAllObjects()
    }
    
    func preloadImage(from urlString: String) {
        Task {
            _ = await getImage(from: urlString)
        }
    }
    
    func getCacheStats() -> (count: Int, totalCost: Int) {
        return (count: cache.countLimit, totalCost: cache.totalCostLimit)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
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
            }
        }
    }
    
    private func loadImage() {
        guard let url = url, !url.isEmpty, !isLoading else { return }
        
        isLoading = true
        Task {
            let downloadedImage = await ImageCacheManager.shared.getImage(from: url)
            
            await MainActor.run {
                self.image = downloadedImage
                self.isLoading = false
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
