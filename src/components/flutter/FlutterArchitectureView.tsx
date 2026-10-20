import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FolderTree,
  Database,
  Smartphone,
  Layers,
  Sparkles,
  Download,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const FlutterArchitectureView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const pubspecContent = `name: minha_casa_ao
description: "Gestão doméstica completa para Angola: Finanças em Kwanzas, compras, despensa e contas."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Arquitetura e Estado
  flutter_riverpod: ^2.5.1
  go_router: ^14.0.1
  
  # Base de Dados Local (SQLite + Web Storage)
  drift: ^2.18.0
  sqlite3_flutter_libs: ^0.5.20 # Android / iOS
  drift_flutter: ^0.1.0         # Suporte unificado Drift Android, iOS e Web
  path_provider: ^2.1.2
  path: ^1.9.0

  # UI, Ícones e Animações
  material_color_utilities: ^0.8.0
  lucide_icons: ^0.359.0
  fl_chart: ^0.68.0             # Gráficos de receitas e despesas
  intl: ^0.19.0                 # Formatação de moeda Kz e datas em pt-AO

  # Notificações Locais
  flutter_local_notifications: ^17.1.0

  # Exportação de Relatórios e Backup
  pdf: ^3.10.8
  printing: ^5.12.0
  csv: ^6.0.0
  share_plus: ^9.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.9
  drift_dev: ^2.18.0

flutter:
  uses-material-design: true
  assets:
    - assets/icons/
    - assets/images/`;

  const folderStructure = `minha_casa_ao/
├── android/                  # Configuração nativa Android (Gradle, Permissões)
│   ├── app/
│   │   ├── build.gradle      # applicationId "com.minhacasa.ao", minSdk 21
│   │   └── src/main/AndroidManifest.xml
├── ios/                      # Configuração iOS
├── web/                      # Suporte Web (Drift Web Worker + WASM)
│   ├── sqlite3.wasm
│   └── drift_worker.js
├── lib/
│   ├── main.dart             # Inicialização do Riverpod e banco de dados
│   ├── core/
│   │   ├── constants/        # Moeda AOA, categorias padrão, contatos de Luanda
│   │   │   ├── app_colors.dart
│   │   │   └── angola_constants.dart # Salários, ENDE, EPAL, Praças
│   │   ├── theme/            # Tema Material 3 (Verde #0F4C3A e tons neutros)
│   │   │   └── app_theme.dart
│   │   ├── utils/            # formatKz(), formatPtDate()
│   │   │   └── currency_formatter.dart
│   │   └── routing/          # GoRouter com navegação por abas
│   │       └── app_router.dart
│   ├── data/
│   │   ├── local/            # Camada Drift / SQLite
│   │   │   ├── app_database.dart
│   │   │   ├── tables/       # Tabelas: transactions, wallets, shopping, pantry...
│   │   │   └── daos/         # Data Access Objects para queries eficientes
│   │   └── repositories/     # Repositórios (offline-first)
│   ├── domain/               # Entidades de negócio puras
│   │   ├── models/           # Household, Transaction, ShoppingItem, Bill...
│   │   └── enums/            # MemberRole, StoreType, BillCategory
│   └── presentation/         # Ecrãs e Widgets (Material 3 + Riverpod)
│       ├── providers/        # Notifiers e Providers de Estado
│       ├── screens/
│       │   ├── dashboard/    # Painel principal
│       │   ├── finances/     # Carteiras, movimentos e transferências
│       │   ├── shopping/     # Compras (Praça, Cantina, Supermercado)
│       │   ├── pantry/       # Despensa e alertas de stock
│       │   ├── bills/        # Contas (ENDE pré-pago, EPAL, Renda)
│       │   ├── tasks/        # Tarefas e organização doméstica
│       │   ├── meals/        # Refeições angolanas e receitas
│       │   ├── debts/        # Dívidas e poupanças (Kixikila)
│       │   ├── maintenance/  # Gerador, ar condicionado e técnicos
│       │   ├── family/       # Agregado familiar e permissões
│       │   └── reports/      # Relatórios, exportação PDF e CSV
│       └── widgets/          # Componentes reutilizáveis
└── test/                     # Testes unitários e de widgets
    ├── unit/
    └── widget/`;

  const driftCode = `// lib/data/local/app_database.dart
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'app_database.g.dart';

// Tabela de Carteiras (Dinheiro vivo, Multicaixa, Unitel Money)
class Wallets extends Table {
  TextColumn get id => text()();
  TextColumn get name => text().withLength(min: 1, max: 50)();
  TextColumn get type => text()(); // cash, multicaixa, unitel_money, bank
  RealColumn get balance => real().withDefault(const Constant(0.0))();
  TextColumn get accountNumber => text().nullable()();
  TextColumn get color => text().withDefault(const Constant('#0F4C3A'))();
  BoolColumn get isDefault => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

// Tabela de Transações Financeiras em Kwanzas
class Transactions extends Table {
  TextColumn get id => text()();
  TextColumn get type => text()(); // income, expense, transfer
  RealColumn get amount => real()();
  TextColumn get categoryId => text()();
  TextColumn get walletId => text().references(Wallets, #id)();
  TextColumn get toWalletId => text().nullable().references(Wallets, #id)();
  DateTimeColumn get date => dateTime()();
  TextColumn get description => text()();
  TextColumn get memberId => text()();
  TextColumn get paymentMethod => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

// Tabela de Itens da Despensa e Stock
class PantryItems extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get category => text()();
  RealColumn get currentQty => real()();
  RealColumn get minQty => real()();
  TextColumn get unit => text()(); // kg, g, litros, unidades, saco
  TextColumn get storageLocation => text()(); // despensa, geleira, congelador, quintal
  DateTimeColumn get purchaseDate => dateTime().nullable()();
  DateTimeColumn get expiryDate => dateTime().nullable()();
  RealColumn get lastPriceKz => real().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

// Tabela de Contas e Encargos (ENDE, EPAL, Gás, Renda)
class Bills extends Table {
  TextColumn get id => text()();
  TextColumn get title => text()();
  TextColumn get category => text()(); // ende_luz, epal_agua, gas, renda, propinas
  RealColumn get estimatedAmount => real()();
  DateTimeColumn get dueDate => dateTime()();
  TextColumn get frequency => text()(); // mensal, quinzenal, semanal
  TextColumn get status => text()(); // pendente, pago, atrasado
  TextColumn get meterNumber => text().nullable()(); // Contador ENDE
  TextColumn get notes => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [Wallets, Transactions, PantryItems, Bills])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    // drift_flutter seleciona automaticamente SQLite no Android/iOS
    // e IndexedDB / WASM no navegador Web!
    return driftDatabase(name: 'minha_casa_ao_db');
  }
}`;

  const riverpodCode = `// lib/presentation/providers/finances_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/local/app_database.dart';

// Provider central da base de dados local Drift
final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

// Stream das transações em tempo real
final transactionsStreamProvider = StreamProvider<List<Transaction>>((ref) {
  final db = ref.watch(databaseProvider);
  return (db.select(db.transactions)..orderBy([(t) => OrderingTerm.desc(t.date)])).watch();
});

// Notifier para gestão de Carteiras
class WalletsNotifier extends StateNotifier<AsyncValue<List<Wallet>>> {
  final AppDatabase db;

  WalletsNotifier(this.db) : super(const AsyncValue.loading()) {
    _loadWallets();
  }

  void _loadWallets() {
    db.select(db.wallets).watch().listen((data) {
      state = AsyncValue.data(data);
    });
  }

  Future<void> transferFunds({
    required String fromWalletId,
    required String toWalletId,
    required double amount,
    required String memberId,
  }) async {
    await db.transaction(() async {
      // 1. Debitar carteira de origem
      final from = await (db.select(db.wallets)..where((w) => w.id.equals(fromWalletId))).getSingle();
      await (db.update(db.wallets)..where((w) => w.id.equals(fromWalletId))).write(
        WalletsCompanion(balance: Value(from.balance - amount)),
      );

      // 2. Creditar carteira de destino
      final to = await (db.select(db.wallets)..where((w) => w.id.equals(toWalletId))).getSingle();
      await (db.update(db.wallets)..where((w) => w.id.equals(toWalletId))).write(
        WalletsCompanion(balance: Value(to.balance + amount)),
      );

      // 3. Registar movimento de transferência
      await db.into(db.transactions).insert(
        TransactionsCompanion.insert(
          id: 'tx_\${DateTime.now().millisecondsSinceEpoch}',
          type: 'transfer',
          amount: amount,
          categoryId: '',
          walletId: fromWalletId,
          toWalletId: Value(toWalletId),
          date: DateTime.now(),
          description: 'Transferência interna: \${from.name} -> \${to.name}',
          memberId: memberId,
        ),
      );
    });
  }
}

final walletsProvider = StateNotifierProvider<WalletsNotifier, AsyncValue<List<Wallet>>>((ref) {
  final db = ref.watch(databaseProvider);
  return WalletsNotifier(db);
});`;

  const apkBuildCommands = `# 1. Clonar ou criar o projeto Flutter
flutter create --org com.minhacasa minha_casa_ao
cd minha_casa_ao

# 2. Obter as dependências definidas no pubspec.yaml
flutter pub get

# 3. Gerar o código automático do Drift e Riverpod (drift_dev e build_runner)
dart run build_runner build --delete-conflicting-outputs

# 4. Executar os testes automatizados da aplicação
flutter test

# 5. Gerar o APK de Produção Otimizado para Android
flutter build apk --release --split-per-abi

# O arquivo APK pronto para instalação em smartphones Android fica localizado em:
# build/app/outputs/flutter-apk/app-arm64-v8a-release.apk

# 6. Gerar o App Bundle (AAB) para publicação oficial na Google Play Store:
flutter build appbundle --release`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-800 text-white">
            <Code2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Dossiê Técnico Flutter & Android APK
            </h2>
            <p className="text-xs text-emerald-200">
              Arquitetura de software móvel para produção (Etapas 1, 5 e 6 do caderno de encargos).
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Esta especificação técnica fornece a base exata em Flutter 3.x, Dart, Riverpod e Drift (SQLite/Web) para a compilação de binários nativos no Android (APK/AAB) e iOS, espelhando todas as funcionalidades ativas na aplicação web.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-6">
        {/* Section 1: Pubspec Dependencies */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                1. Configuração de Dependências (pubspec.yaml)
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(pubspecContent, 'pubspec')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedSection === 'pubspec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'pubspec' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="mt-3 p-4 bg-slate-950 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {pubspecContent}
          </pre>
        </div>

        {/* Section 2: Folder Structure */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-sm text-slate-900">
                2. Estrutura de Pastas Modular (Clean Architecture)
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(folderStructure, 'folders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedSection === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'folders' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="mt-3 p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {folderStructure}
          </pre>
        </div>

        {/* Section 3: Drift Database Schema (SQLite + Web) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                3. Camada de Dados Local Drift (SQLite / Web Compatível)
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(driftCode, 'drift')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedSection === 'drift' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'drift' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Utiliza o pacote oficial <code>drift_flutter</code> que abstrai automaticamente o SQLite C-library no Android e o IndexedDB/WASM na Web, garantindo que o banco de dados nunca falhe no browser.
          </p>

          <pre className="mt-3 p-4 bg-slate-950 text-sky-300 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {driftCode}
          </pre>
        </div>

        {/* Section 4: Riverpod State Providers */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">
                4. Gestão de Estado com Riverpod (Transferências Atómicas)
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(riverpodCode, 'riverpod')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedSection === 'riverpod' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'riverpod' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="mt-3 p-4 bg-slate-950 text-amber-200 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {riverpodCode}
          </pre>
        </div>

        {/* Section 5: APK Compilation & Google Play Release */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                5. Comandos para Gerar o APK Android e Publicar na Play Store
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(apkBuildCommands, 'apk')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              {copiedSection === 'apk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'apk' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="mt-3 p-4 bg-slate-950 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {apkBuildCommands}
          </pre>
        </div>
      </div>
    </div>
  );
};
