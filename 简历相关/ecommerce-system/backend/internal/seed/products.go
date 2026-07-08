package seed

import "ecommerce-system/backend/internal/domain"

func Products() []domain.Product {
	return []domain.Product{
		{
			ID:          "p-camera-001",
			Title:       "4K Smart Security Camera",
			Description: "Indoor and outdoor camera with AI motion detection.",
			Category:    "security",
			ImageURL:    "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%204K%20smart%20home%20security%20camera%20on%20clean%20desk%20product%20photography&image_size=landscape_4_3",
			Price:       399,
			SalesCount:  1240,
			Rating:      5,
			Stock:       42,
			SKUs: []domain.SKU{
				{ID: "sku-camera-white", Label: "White", Price: 399, Stock: 30},
				{ID: "sku-camera-black", Label: "Black", Price: 429, Stock: 12},
			},
		},
		{
			ID:          "p-doorbell-002",
			Title:       "Video Doorbell Pro",
			Description: "Battery powered video doorbell with cloud recording.",
			Category:    "security",
			ImageURL:    "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20video%20doorbell%20mounted%20beside%20modern%20front%20door%20product%20photography&image_size=landscape_4_3",
			Price:       529,
			SalesCount:  860,
			Rating:      4,
			Stock:       18,
			SKUs: []domain.SKU{
				{ID: "sku-doorbell-standard", Label: "Standard", Price: 529, Stock: 18},
			},
		},
		{
			ID:          "p-hub-003",
			Title:       "Smart Home Hub",
			Description: "Connect sensors, cameras, and automations in one place.",
			Category:    "smart-home",
			ImageURL:    "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20minimal%20smart%20home%20hub%20with%20soft%20ambient%20light%20product%20photography&image_size=landscape_4_3",
			Price:       299,
			SalesCount:  540,
			Rating:      4,
			Stock:       0,
			SKUs: []domain.SKU{
				{ID: "sku-hub-basic", Label: "Basic", Price: 299, Stock: 0},
			},
		},
		{
			ID:          "p-sensor-004",
			Title:       "Door Window Sensor Pack",
			Description: "Four-pack compact sensors for entry monitoring.",
			Category:    "accessory",
			ImageURL:    "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20door%20window%20sensor%20pack%20on%20white%20background%20product%20photography&image_size=landscape_4_3",
			Price:       169,
			SalesCount:  2200,
			Rating:      5,
			Stock:       90,
			SKUs: []domain.SKU{
				{ID: "sku-sensor-four", Label: "4 pack", Price: 169, Stock: 90},
			},
		},
	}
}
