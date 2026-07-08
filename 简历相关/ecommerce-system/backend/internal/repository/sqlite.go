package repository

import (
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"strings"
	"time"

	"ecommerce-system/backend/internal/domain"
	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaSQL string

type SQLiteStore struct {
	db *sql.DB
}

func OpenSQLiteStore(ctx context.Context, path string, products []domain.Product) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	store := &SQLiteStore{db: db}
	if err := store.init(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}
	if err := store.SeedProducts(ctx, products); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (store *SQLiteStore) Close() error {
	return store.db.Close()
}

func (store *SQLiteStore) init(ctx context.Context) error {
	if _, err := store.db.ExecContext(ctx, "PRAGMA foreign_keys = ON"); err != nil {
		return err
	}
	_, err := store.db.ExecContext(ctx, schemaSQL)
	return err
}

func (store *SQLiteStore) SeedProducts(ctx context.Context, products []domain.Product) error {
	var count int
	if err := store.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM products").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	tx, err := store.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer rollbackUnlessCommitted(tx)

	for _, product := range products {
		if _, err := tx.ExecContext(
			ctx,
			`INSERT INTO products (id, title, description, category, image_url, price, sales_count, rating)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			product.ID,
			product.Title,
			product.Description,
			product.Category,
			product.ImageURL,
			product.Price,
			product.SalesCount,
			product.Rating,
		); err != nil {
			return err
		}
		for _, sku := range product.SKUs {
			if _, err := tx.ExecContext(
				ctx,
				`INSERT INTO product_skus (id, product_id, label, price, stock)
				 VALUES (?, ?, ?, ?, ?)`,
				sku.ID,
				product.ID,
				sku.Label,
				sku.Price,
				sku.Stock,
			); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (store *SQLiteStore) ListProducts(query domain.ProductQuery) domain.PageResult[domain.Product] {
	ctx := context.Background()
	where, args := productWhere(query)
	total := 0
	countQuery := "SELECT COUNT(*) FROM products p " + where
	if err := store.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return domain.PageResult[domain.Product]{Items: []domain.Product{}, Page: domain.PageMeta{Page: 1, PageSize: query.PageSize}}
	}

	page, pageSize := normalizedPage(query.Page, query.PageSize)
	totalPages := (total + pageSize - 1) / pageSize
	offset := (page - 1) * pageSize
	orderBy := productOrderBy(query.Sort)
	rows, err := store.db.QueryContext(
		ctx,
		`SELECT p.id, p.title, p.description, p.category, p.image_url, p.price, p.sales_count, p.rating,
		        COALESCE(SUM(s.stock), 0) AS stock
		   FROM products p
		   LEFT JOIN product_skus s ON s.product_id = p.id `+
			where+
			` GROUP BY p.id, p.title, p.description, p.category, p.image_url, p.price, p.sales_count, p.rating `+
			orderBy+
			` LIMIT ? OFFSET ?`,
		append(args, pageSize, offset)...,
	)
	if err != nil {
		return domain.PageResult[domain.Product]{Items: []domain.Product{}, Page: domain.PageMeta{Page: page, PageSize: pageSize}}
	}
	defer rows.Close()

	products := make([]domain.Product, 0, pageSize)
	for rows.Next() {
		product, err := scanProduct(rows)
		if err != nil {
			return domain.PageResult[domain.Product]{Items: []domain.Product{}, Page: domain.PageMeta{Page: page, PageSize: pageSize}}
		}
		products = append(products, product)
	}
	if err := rows.Close(); err != nil {
		return domain.PageResult[domain.Product]{Items: []domain.Product{}, Page: domain.PageMeta{Page: page, PageSize: pageSize}}
	}
	for index := range products {
		products[index].SKUs, _ = store.loadSKUs(ctx, products[index].ID)
	}
	return domain.PageResult[domain.Product]{
		Items: products,
		Page: domain.PageMeta{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}

func (store *SQLiteStore) GetProduct(id string) (domain.Product, error) {
	ctx := context.Background()
	row := store.db.QueryRowContext(
		ctx,
		`SELECT p.id, p.title, p.description, p.category, p.image_url, p.price, p.sales_count, p.rating,
		        COALESCE(SUM(s.stock), 0) AS stock
		   FROM products p
		   LEFT JOIN product_skus s ON s.product_id = p.id
		  WHERE p.id = ?
		  GROUP BY p.id, p.title, p.description, p.category, p.image_url, p.price, p.sales_count, p.rating`,
		id,
	)
	product, err := scanProduct(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Product{}, ErrNotFound
		}
		return domain.Product{}, err
	}
	product.SKUs, err = store.loadSKUs(ctx, id)
	return product, err
}

func (store *SQLiteStore) SaveOrder(order domain.Order) error {
	ctx := context.Background()
	tx, err := store.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer rollbackUnlessCommitted(tx)

	for _, item := range order.Items {
		var stock int
		err := tx.QueryRowContext(
			ctx,
			"SELECT stock FROM product_skus WHERE id = ? AND product_id = ?",
			item.SKUID,
			item.ProductID,
		).Scan(&stock)
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if err != nil {
			return err
		}
		if stock < item.Quantity {
			return errors.New("insufficient stock")
		}
	}

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO orders (id, order_no, status, subtotal, discount, shipping_fee, payable, receiver, phone, address, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		order.ID,
		order.OrderNo,
		string(order.Status),
		order.Summary.Subtotal,
		order.Summary.Discount,
		order.Summary.ShippingFee,
		order.Summary.Payable,
		order.Shipping.Receiver,
		order.Shipping.Phone,
		order.Shipping.Address,
		order.CreatedAt.Format(time.RFC3339Nano),
	); err != nil {
		return err
	}

	for _, item := range order.Items {
		if _, err := tx.ExecContext(
			ctx,
			`INSERT INTO order_items (order_id, product_id, sku_id, title, sku_label, unit_price, quantity)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			order.ID,
			item.ProductID,
			item.SKUID,
			item.Title,
			item.SKULabel,
			item.UnitPrice,
			item.Quantity,
		); err != nil {
			return err
		}
		result, err := tx.ExecContext(
			ctx,
			`UPDATE product_skus
			    SET stock = stock - ?
			  WHERE id = ? AND product_id = ? AND stock >= ?`,
			item.Quantity,
			item.SKUID,
			item.ProductID,
			item.Quantity,
		)
		if err != nil {
			return err
		}
		affected, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if affected != 1 {
			return errors.New("insufficient stock")
		}
	}

	for _, event := range order.Timeline {
		if _, err := tx.ExecContext(
			ctx,
			"INSERT INTO order_timelines (order_id, status, at) VALUES (?, ?, ?)",
			order.ID,
			string(event.Status),
			event.At.Format(time.RFC3339Nano),
		); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (store *SQLiteStore) ListOrders(status string) domain.PageResult[domain.Order] {
	ctx := context.Background()
	query := `SELECT id, order_no, status, subtotal, discount, shipping_fee, payable, receiver, phone, address, created_at
	            FROM orders`
	args := []any{}
	if status != "" {
		query += " WHERE status = ?"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC LIMIT 20"

	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return domain.PageResult[domain.Order]{Items: []domain.Order{}, Page: domain.PageMeta{Page: 1, PageSize: 20}}
	}
	defer rows.Close()

	orders := make([]domain.Order, 0)
	for rows.Next() {
		order, err := scanOrder(rows)
		if err != nil {
			continue
		}
		orders = append(orders, order)
	}
	if err := rows.Close(); err != nil {
		return domain.PageResult[domain.Order]{Items: []domain.Order{}, Page: domain.PageMeta{Page: 1, PageSize: 20}}
	}
	for index := range orders {
		orders[index].Items, _ = store.loadOrderItems(ctx, orders[index].ID)
		orders[index].Timeline, _ = store.loadTimeline(ctx, orders[index].ID)
	}
	return domain.PageResult[domain.Order]{
		Items: orders,
		Page: domain.PageMeta{
			Page:       1,
			PageSize:   20,
			Total:      len(orders),
			TotalPages: 1,
		},
	}
}

func (store *SQLiteStore) GetOrder(id string) (domain.Order, error) {
	ctx := context.Background()
	row := store.db.QueryRowContext(
		ctx,
		`SELECT id, order_no, status, subtotal, discount, shipping_fee, payable, receiver, phone, address, created_at
		   FROM orders
		  WHERE id = ?`,
		id,
	)
	order, err := scanOrder(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Order{}, ErrNotFound
		}
		return domain.Order{}, err
	}
	order.Items, err = store.loadOrderItems(ctx, order.ID)
	if err != nil {
		return domain.Order{}, err
	}
	order.Timeline, err = store.loadTimeline(ctx, order.ID)
	if err != nil {
		return domain.Order{}, err
	}
	return order, nil
}

func (store *SQLiteStore) UpdateOrder(order domain.Order) error {
	ctx := context.Background()
	tx, err := store.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer rollbackUnlessCommitted(tx)

	result, err := tx.ExecContext(ctx, "UPDATE orders SET status = ? WHERE id = ?", string(order.Status), order.ID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected != 1 {
		return ErrNotFound
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM order_timelines WHERE order_id = ?", order.ID); err != nil {
		return err
	}
	for _, event := range order.Timeline {
		if _, err := tx.ExecContext(
			ctx,
			"INSERT INTO order_timelines (order_id, status, at) VALUES (?, ?, ?)",
			order.ID,
			string(event.Status),
			event.At.Format(time.RFC3339Nano),
		); err != nil {
			return err
		}
	}
	return tx.Commit()
}

type productScanner interface {
	Scan(dest ...any) error
}

func scanProduct(scanner productScanner) (domain.Product, error) {
	var product domain.Product
	err := scanner.Scan(
		&product.ID,
		&product.Title,
		&product.Description,
		&product.Category,
		&product.ImageURL,
		&product.Price,
		&product.SalesCount,
		&product.Rating,
		&product.Stock,
	)
	return product, err
}

func (store *SQLiteStore) loadSKUs(ctx context.Context, productID string) ([]domain.SKU, error) {
	rows, err := store.db.QueryContext(
		ctx,
		"SELECT id, label, price, stock FROM product_skus WHERE product_id = ? ORDER BY id",
		productID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skus []domain.SKU
	for rows.Next() {
		var sku domain.SKU
		if err := rows.Scan(&sku.ID, &sku.Label, &sku.Price, &sku.Stock); err != nil {
			return nil, err
		}
		skus = append(skus, sku)
	}
	return skus, rows.Err()
}

func scanOrder(scanner productScanner) (domain.Order, error) {
	var order domain.Order
	var status string
	var createdAt string
	err := scanner.Scan(
		&order.ID,
		&order.OrderNo,
		&status,
		&order.Summary.Subtotal,
		&order.Summary.Discount,
		&order.Summary.ShippingFee,
		&order.Summary.Payable,
		&order.Shipping.Receiver,
		&order.Shipping.Phone,
		&order.Shipping.Address,
		&createdAt,
	)
	if err != nil {
		return domain.Order{}, err
	}
	order.Status = domain.OrderStatus(status)
	order.CreatedAt, err = time.Parse(time.RFC3339Nano, createdAt)
	return order, err
}

func (store *SQLiteStore) loadOrderItems(ctx context.Context, orderID string) ([]domain.OrderItem, error) {
	rows, err := store.db.QueryContext(
		ctx,
		`SELECT product_id, sku_id, title, sku_label, unit_price, quantity
		   FROM order_items
		  WHERE order_id = ?
		  ORDER BY id`,
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.OrderItem
	for rows.Next() {
		var item domain.OrderItem
		if err := rows.Scan(&item.ProductID, &item.SKUID, &item.Title, &item.SKULabel, &item.UnitPrice, &item.Quantity); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (store *SQLiteStore) loadTimeline(ctx context.Context, orderID string) ([]domain.TimelineEvent, error) {
	rows, err := store.db.QueryContext(
		ctx,
		"SELECT status, at FROM order_timelines WHERE order_id = ? ORDER BY id",
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var timeline []domain.TimelineEvent
	for rows.Next() {
		var status string
		var at string
		if err := rows.Scan(&status, &at); err != nil {
			return nil, err
		}
		parsed, err := time.Parse(time.RFC3339Nano, at)
		if err != nil {
			return nil, err
		}
		timeline = append(timeline, domain.TimelineEvent{Status: domain.OrderStatus(status), At: parsed})
	}
	return timeline, rows.Err()
}

func productWhere(query domain.ProductQuery) (string, []any) {
	var clauses []string
	var args []any
	if query.Keyword != "" {
		clauses = append(clauses, "(lower(p.title) LIKE ? OR lower(p.description) LIKE ?)")
		keyword := "%" + strings.ToLower(query.Keyword) + "%"
		args = append(args, keyword, keyword)
	}
	if query.Category != "" {
		clauses = append(clauses, "p.category = ?")
		args = append(args, query.Category)
	}
	if query.MinPrice > 0 {
		clauses = append(clauses, "p.price >= ?")
		args = append(args, query.MinPrice)
	}
	if query.MaxPrice > 0 {
		clauses = append(clauses, "p.price <= ?")
		args = append(args, query.MaxPrice)
	}
	if query.InStock != nil {
		if *query.InStock {
			clauses = append(clauses, "EXISTS (SELECT 1 FROM product_skus s2 WHERE s2.product_id = p.id AND s2.stock > 0)")
		} else {
			clauses = append(clauses, "NOT EXISTS (SELECT 1 FROM product_skus s2 WHERE s2.product_id = p.id AND s2.stock > 0)")
		}
	}
	if query.MinRating > 0 {
		clauses = append(clauses, "p.rating >= ?")
		args = append(args, query.MinRating)
	}
	if len(clauses) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(clauses, " AND "), args
}

func productOrderBy(sortKey string) string {
	switch sortKey {
	case "price_asc":
		return " ORDER BY p.price ASC"
	case "price_desc":
		return " ORDER BY p.price DESC"
	case "sales":
		return " ORDER BY p.sales_count DESC"
	case "rating":
		return " ORDER BY p.rating DESC"
	default:
		return " ORDER BY p.id ASC"
	}
}

func normalizedPage(page int, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return page, pageSize
}

func rollbackUnlessCommitted(tx *sql.Tx) {
	_ = tx.Rollback()
}
