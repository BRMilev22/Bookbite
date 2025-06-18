//
//  Theme.swift
//  BookBite
//
//  Created by Boris Milev on 17.06.25.
//

import SwiftUI

struct Theme {
    // MARK: - Colors
    struct Colors {
        static let primary = Color(red: 0.31, green: 0.27, blue: 0.9) // #4F46E5 - BookBite Blue
        static let success = Color(red: 0.0, green: 0.7, blue: 0.4)   // #00B347 - Green
        static let warning = Color(red: 1.0, green: 0.6, blue: 0.0)   // #FF9900 - Orange
        static let danger = Color(red: 0.96, green: 0.26, blue: 0.21) // #F54336 - Red
        
        // Status Colors
        static let confirmed = success
        static let pending = warning
        static let cancelled = danger
        static let paid = success
        static let refunded = danger
        
        // Adaptive Background Colors
        static let background = Color(UIColor.systemGroupedBackground)
        static let cardBackground = Color(UIColor.secondarySystemGroupedBackground)
        static let inputBackground = Color(UIColor.tertiarySystemFill)
        static let primaryBackground = Color(UIColor.systemBackground)
        
        // Text Colors
        static let primaryText = Color(UIColor.label)
        static let secondaryText = Color(UIColor.secondaryLabel)
        static let tertiaryText = Color(UIColor.tertiaryLabel)
        
        // System Adaptive Colors
        static let separator = Color(UIColor.separator)
        static let overlay = Color(UIColor.systemFill)
        
        // Dark mode aware shadow
        static let shadowColor = Color.primary.opacity(0.1)
    }
    
    // MARK: - Typography
    struct Typography {
        static let largeTitle = Font.system(size: 28, weight: .bold, design: .default)
        static let title = Font.system(size: 24, weight: .bold)
        static let headline = Font.system(size: 18, weight: .semibold)
        static let body = Font.system(size: 16, weight: .regular)
        static let caption = Font.system(size: 14, weight: .medium)
        static let small = Font.system(size: 12, weight: .medium)
        static let tiny = Font.system(size: 10, weight: .medium)
    }
    
    // MARK: - Spacing
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
    }
    
    // MARK: - Corner Radius
    struct CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let pill: CGFloat = 25
    }
    
    // MARK: - Shadows
    struct Shadows {
        static let card = Color.primary.opacity(0.08)
        static let light = Color.primary.opacity(0.05)
    }
}

// MARK: - Convenience Extensions
extension Color {
    static let theme = Theme.Colors.self
}

extension Font {
    static let theme = Theme.Typography.self
}
