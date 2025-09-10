import { describe, it, expect, beforeAll } from 'vitest';
import { readdir, readFile, access } from 'fs/promises';
import path from 'path';

const BOOKS_DIR = path.join(process.cwd(), 'public', 'books');

interface MenuItem {
  title: string;
  author: string;
  file_name: string;
}

interface MenuJson {
  book_title: string;
  year: string;
  items: MenuItem[];
}

describe('書籍ディレクトリ検証', () => {
  it('public/booksディレクトリが存在確認', async () => {
    // public/booksディレクトリが存在することを確認
    await expect(access(BOOKS_DIR)).resolves.not.toThrow();
  });

  it('最低1つの書籍ディレクトリが存在確認', async () => {
    // public/books内のエントリを取得
    const entries = await readdir(BOOKS_DIR, { withFileTypes: true });
    
    // ディレクトリのみをフィルタリング
    const directories = entries.filter(entry => entry.isDirectory());
    
    // 最低1つのディレクトリが存在することを確認
    expect(directories.length).toBeGreaterThan(0);
  });

  describe('PNGファイルの造の検証', () => {
    it('各書籍ディレクトリのPNGファイルが連番かの確認', async () => {
      // 全てのbookディレクトリを取得
      const entries = await readdir(BOOKS_DIR, { withFileTypes: true });
      const bookDirectories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      for (const bookDir of bookDirectories) {
        console.log(`Testing PNG files in directory: ${bookDir}`);

        // ディレクトリ内のPNGファイルを取得して連番確認の準備
        const bookPath = path.join(BOOKS_DIR, bookDir);
        const files = await readdir(bookPath);
        
        const pngFiles = files
          .filter(file => file.endsWith('.png'))
          .sort();
        
        expect(pngFiles.length).toBeGreaterThan(0);
        
        // 000.pngから始まることを確認（連番の開始点）
        const zeroPngPath = path.join(bookPath, '000.png');
        await expect(access(zeroPngPath)).resolves.not.toThrow();

        // PNGファイルが連番（000, 001, 002...）になっていることを確認
        for (let i = 0; i < pngFiles.length; i++) {
          const expectedFilename = String(i).padStart(3, '0') + '.png';
          expect(pngFiles).toContain(expectedFilename);
          
          const filePath = path.join(bookPath, expectedFilename);
          await expect(access(filePath)).resolves.not.toThrow();
        }
      }
    });
  });

  describe('menu.json検証', () => {
    it('各書籍ディレクトリのmenu.jsonが正しい形式であるかの確認', async () => {
      // 全てのbookディレクトリを取得
      const entries = await readdir(BOOKS_DIR, { withFileTypes: true });
      const bookDirectories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      for (const bookDir of bookDirectories) {
        console.log(`Testing menu.json in directory: ${bookDir}`);

        // 1. menu.jsonファイルが存在することを確認
        const menuPath = path.join(BOOKS_DIR, bookDir, 'menu.json');
        await expect(access(menuPath)).resolves.not.toThrow();

        // 2. menu.jsonの内容が正しいJSON形式であることを確認
        const menuContent = await readFile(menuPath, 'utf-8');
        
        let menuJson: MenuJson;
        expect(() => {
          menuJson = JSON.parse(menuContent);
        }).not.toThrow();

        menuJson = JSON.parse(menuContent);
        
        // 3. menu.jsonの必須プロパティが存在することを確認
        expect(menuJson).toHaveProperty('book_title');
        expect(menuJson).toHaveProperty('year');
        expect(menuJson).toHaveProperty('items');
        expect(Array.isArray(menuJson.items)).toBe(true);
        expect(typeof menuJson.book_title).toBe('string');
        expect(typeof menuJson.year).toBe('string');

        // 4. menu.json内の各itemの形式が正しいことを確認
        for (const item of menuJson.items) {
          expect(item).toHaveProperty('title');
          expect(item).toHaveProperty('author');
          expect(item).toHaveProperty('file_name');
          expect(typeof item.title).toBe('string');
          expect(typeof item.author).toBe('string');
          expect(typeof item.file_name).toBe('string');
          expect(item.file_name.endsWith('.png')).toBe(true);
          
          // file_nameにディレクトリパスが含まれていないことを確認（同じディレクトリ内のファイルのみ参照）
          expect(item.file_name).not.toMatch(/[/\\]/);
        }

        // 5. menu.jsonが正しいディレクトリに配置されていることを確認
        const bookPath = path.join(BOOKS_DIR, bookDir);
        const dirFiles = await readdir(bookPath);
        expect(dirFiles).toContain('menu.json');
      }
    });

    it('menu.json内で参照されているPNGファイルが同じディレクトリ内に存在するかの確認', async () => {
      // 全てのbookディレクトリを取得
      const entries = await readdir(BOOKS_DIR, { withFileTypes: true });
      const bookDirectories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      for (const bookDir of bookDirectories) {
        console.log(`Testing menu.json file references in directory: ${bookDir}`);

        // menu.jsonを読み込み
        const menuPath = path.join(BOOKS_DIR, bookDir, 'menu.json');
        const menuContent = await readFile(menuPath, 'utf-8');
        const menuJson: MenuJson = JSON.parse(menuContent);

        // ディレクトリ内のPNGファイルを取得
        const bookPath = path.join(BOOKS_DIR, bookDir);
        const files = await readdir(bookPath);
        const pngFiles = files
          .filter(file => file.endsWith('.png'))
          .sort();

        // menu.json内で参照されている全てのPNGファイルが同じディレクトリ内に実際に存在することを確認
        for (const item of menuJson.items) {
          // 同じディレクトリ内のファイルパスを構築
          const imagePath = path.join(BOOKS_DIR, bookDir, item.file_name);
          
          // ファイルが実際に存在することを確認
          await expect(access(imagePath)).resolves.not.toThrow();
          
          // 参照されているファイルが実際にディレクトリ内の.pngファイル一覧に含まれていることを確認
          expect(pngFiles).toContain(item.file_name);
        }
      }
    });
  });
});