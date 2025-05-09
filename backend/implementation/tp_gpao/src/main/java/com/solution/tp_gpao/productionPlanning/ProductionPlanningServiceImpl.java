package com.solution.tp_gpao.productionPlanning;

import com.solution.tp_gpao.articles.ArticleEntity;
import com.solution.tp_gpao.articles.ArticleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ProductionPlanningServiceImpl implements ProductionPlanningService {

    @Autowired
    private ArticleRepo articleRepo;
    @Autowired
    private MachineRepository machineRepository;
    @Autowired
    private ProductMachineOperationRepository operationRepository;

    // Returns products, machines, and the operation matrix
    public Map<String, Object> getMatrix() {
        List<ArticleEntity> products = articleRepo.findAll();
        List<MachineEntity> machines = machineRepository.findAll();
        List<ProductMachineOperation> ops = operationRepository.findAll();
        
        if (products == null || machines == null || ops == null) {
            return Map.of(
                "products", Collections.emptyList(),
                "machines", Collections.emptyList(),
                "matrix", Collections.emptyList()
            );
        }

        int nProducts = products.size();
        int nMachines = machines.size();
        int[][] matrix = new int[nProducts][nMachines];
        
        for (ProductMachineOperation op : ops) {
            if (op == null || op.getArticle() == null || op.getMachine() == null) continue;
            
            int pIdx = -1, mIdx = -1;
            for (int i = 0; i < nProducts; i++) {
                if (products.get(i) != null && products.get(i).getArticleId() == op.getArticle().getArticleId()) {
                    pIdx = i;
                    break;
                }
            }
            for (int j = 0; j < nMachines; j++) {
                if (machines.get(j) != null && machines.get(j).getId().equals(op.getMachine().getId())) {
                    mIdx = j;
                    break;
                }
            }
            if (pIdx != -1 && mIdx != -1) matrix[pIdx][mIdx] = op.getOperationNumber();
        }

        List<Map<String, Object>> productList = new ArrayList<>();
        for (ArticleEntity a : products) {
            if (a != null) {
                productList.add(Map.of(
                    "id", a.getArticleId(),
                    "name", a.getName() != null ? a.getName() : ""
                ));
            }
        }

        List<Map<String, Object>> machineList = new ArrayList<>();
        for (MachineEntity m : machines) {
            if (m != null) {
                machineList.add(Map.of(
                    "id", m.getId(),
                    "name", m.getName() != null ? m.getName() : ""
                ));
            }
        }

        List<List<Integer>> matrixList = new ArrayList<>();
        for (int[] row : matrix) {
            List<Integer> rowList = new ArrayList<>();
            for (int v : row) rowList.add(v);
            matrixList.add(rowList);
        }

        return Map.of(
            "products", productList,
            "machines", machineList,
            "matrix", matrixList
        );
    }

    // Nouvelle version fidèle à l'algorithme Kuziack fourni
    public Map<String, Object> runKuziack(Map<String, Object> matrixRequest) {
        List<List<Integer>> matrix = (List<List<Integer>>) matrixRequest.get("matrix");
        List<Map<String, Object>> products = (List<Map<String, Object>>) matrixRequest.get("products");
        List<Map<String, Object>> machines = (List<Map<String, Object>>) matrixRequest.get("machines");
        Integer startIndex = (Integer) matrixRequest.get("startIndex");
        
        if (matrix == null || products == null || machines == null) {
            return Map.of("cells", Collections.emptyList());
        }

        int nProducts = matrix.size();
        int nMachines = matrix.isEmpty() ? 0 : matrix.get(0).size();
        
        String[] productNames = new String[nProducts];
        String[] machineNames = new String[nMachines];
        for (int i = 0; i < nProducts; i++) productNames[i] = (String) products.get(i).get("name");
        for (int j = 0; j < nMachines; j++) machineNames[j] = (String) machines.get(j).get("name");

        if (startIndex == null || startIndex < 0 || startIndex >= nProducts) startIndex = 0;

        List<Map<String, Object>> cells = new ArrayList<>();
        List<Integer> remainingProducts = new ArrayList<>();
        List<Integer> remainingMachines = new ArrayList<>();
        for (int i = 0; i < nProducts; i++) remainingProducts.add(i);
        for (int j = 0; j < nMachines; j++) remainingMachines.add(j);
        int step = 1;
        
        while (!remainingProducts.isEmpty()) {
            Set<Integer> currentIlotProducts = new HashSet<>();
            Set<Integer> currentIlotMachines = new HashSet<>();

            // Étape 2 : Sélectionner une ligne (la première restante ou startIndex)
            int p0 = remainingProducts.contains(startIndex) ? startIndex : remainingProducts.get(0);
            currentIlotProducts.add(p0);
            // Machines associées au produit initial
            for (int m = 0; m < nMachines; m++) {
                if (matrix.get(p0).get(m) == 1) {
                    currentIlotMachines.add(m);
                }
            }
            
            boolean updated = true;
            while (updated) {
                updated = false;
                // Étape 3 : Ajouter produits dont ≥50% machines dans l'îlot
                for (int p : new ArrayList<>(remainingProducts)) {
                    if (currentIlotProducts.contains(p)) continue;
                    Set<Integer> machinesUsed = new HashSet<>();
                    for (int m = 0; m < nMachines; m++) {
                        if (matrix.get(p).get(m) == 1) machinesUsed.add(m);
                    }
                    if (machinesUsed.isEmpty()) continue;
                    Set<Integer> overlap = new HashSet<>(machinesUsed);
                    overlap.retainAll(currentIlotMachines);
                    if (overlap.size() >= 0.5 * machinesUsed.size()) {
                        currentIlotProducts.add(p);
                        updated = true;
                    }
                }
                // Étape 4 : Ajouter machines dont ≥50% produits dans l'îlot
                for (int m : new ArrayList<>(remainingMachines)) {
                    if (currentIlotMachines.contains(m)) continue;
                    Set<Integer> productsUsing = new HashSet<>();
                    for (int p = 0; p < nProducts; p++) {
                        if (matrix.get(p).get(m) == 1) productsUsing.add(p);
                    }
                    if (productsUsing.isEmpty()) continue;
                    Set<Integer> overlap = new HashSet<>(productsUsing);
                    overlap.retainAll(currentIlotProducts);
                    if (overlap.size() >= 0.5 * productsUsing.size()) {
                        currentIlotMachines.add(m);
                        updated = true;
                    }
                }
            }
            // Affichage de l'îlot trouvé (ici, on prépare la structure de retour)
            List<Integer> selectedProducts = new ArrayList<>(currentIlotProducts);
            Collections.sort(selectedProducts);
            List<Integer> selectedMachines = new ArrayList<>(currentIlotMachines);
            Collections.sort(selectedMachines);
            // Sous-matrice de l'îlot
            List<List<Integer>> subMatrix = new ArrayList<>();
            for (int p : selectedProducts) {
                List<Integer> row = new ArrayList<>();
                for (int m : selectedMachines) {
                    row.add(matrix.get(p).get(m));
                }
                subMatrix.add(row);
            }
            // Préparer les infos produits/machines
            List<Map<String, Object>> cellProducts = new ArrayList<>();
            for (int p : selectedProducts) {
                cellProducts.add(Map.of(
                    "id", products.get(p).get("id"),
                    "name", productNames[p],
                    "index", p
                ));
            }
            List<Map<String, Object>> cellMachines = new ArrayList<>();
            for (int m : selectedMachines) {
                cellMachines.add(Map.of(
                    "id", machines.get(m).get("id"),
                    "name", machineNames[m],
                    "index", m
                ));
            }
            cells.add(Map.of(
                "step", step,
                "products", cellProducts,
                "machines", cellMachines,
                "submatrix", subMatrix
            ));
            // Étape 6 : Retirer l'îlot
            remainingProducts.removeIf(currentIlotProducts::contains);
            remainingMachines.removeIf(currentIlotMachines::contains);
            step++;
        }
        return Map.of("cells", cells);
    }

    // Modified King algorithm implementation
    public Map<String, Object> runKing(Map<String, Object> matrixRequest) {
        MatrixRequest request = convertToMatrixRequest(matrixRequest);
        KingResponse response = runKing(request);
        
        return Map.of(
            "order", response.getOrder().stream()
                .map(order -> Map.of(
                    "id", order.getId(),
                    "name", order.getName(),
                    "index", order.getIndex()
                ))
                .collect(Collectors.toList())
        );
    }

    @Override
    public KingResponse runKing(MatrixRequest request) {
        if (request.getMatrix() == null || request.getMachines() == null) {
            throw new IllegalArgumentException("Matrix and machines must not be null");
        }

        int[][] matrix = request.getMatrix();
        List<MachineEntity> machines = request.getMachines();
        int nProducts = matrix.length;
        int nMachines = matrix[0].length;

        // Product and machine names
        List<String> productNames = new ArrayList<>();
        for (int i = 0; i < nProducts; i++) productNames.add("P" + (i + 1));
        List<String> machineNames = new ArrayList<>();
        for (int j = 0; j < nMachines; j++) machineNames.add(machines.get(j).getName());

        int[][] currentMatrix = Arrays.stream(matrix).map(int[]::clone).toArray(int[][]::new);
        List<String> currentProductNames = new ArrayList<>(productNames);
        List<String> currentMachineNames = new ArrayList<>(machineNames);

        boolean stabilized = false;
        int iteration = 1;
        List<Integer> prevRowOrder = null;
        List<Integer> prevColOrder = null;
        while (!stabilized) {
            // --- Sort products (rows) ---
            int[] colWeights = new int[nMachines];
            for (int i = 0; i < nMachines; i++) colWeights[i] = 1 << (nMachines - i - 1);
            int[] rowValues = new int[nProducts];
            for (int i = 0; i < nProducts; i++) rowValues[i] = binaryToDecimal(currentMatrix[i], colWeights);
            int[] rowRanks = getRanks(rowValues);
            List<Integer> rowOrder = IntStream.range(0, nProducts)
                .boxed()
                .sorted((a, b) -> Integer.compare(rowValues[b], rowValues[a]))
                .collect(Collectors.toList());
            int[][] nextMatrix = new int[nProducts][nMachines];
            List<String> nextProductNames = new ArrayList<>();
            for (int i = 0; i < nProducts; i++) {
                nextMatrix[i] = currentMatrix[rowOrder.get(i)];
                nextProductNames.add(currentProductNames.get(rowOrder.get(i)));
            }
            int[] nextRowValues = rowOrder.stream().mapToInt(i -> rowValues[i]).toArray();
            int[] nextRowRanks = rowOrder.stream().mapToInt(i -> getRanks(rowValues)[i]).toArray();

            // --- Sort machines (columns) ---
            int[] rowWeights = new int[nProducts];
            for (int i = 0; i < nProducts; i++) rowWeights[i] = 1 << (nProducts - i - 1);
            int[] colValues = new int[nMachines];
            for (int j = 0; j < nMachines; j++) {
                int[] col = new int[nProducts];
                for (int i = 0; i < nProducts; i++) col[i] = nextMatrix[i][j];
                colValues[j] = binaryToDecimal(col, rowWeights);
            }
            int[] colRanks = getRanks(colValues);
            List<Integer> colOrder = IntStream.range(0, nMachines)
                .boxed()
                .sorted((a, b) -> Integer.compare(colValues[b], colValues[a]))
                .collect(Collectors.toList());
            int[][] nextMatrixCols = new int[nProducts][nMachines];
            List<String> nextMachineNames = new ArrayList<>();
            for (int j = 0; j < nMachines; j++) {
                for (int i = 0; i < nProducts; i++) {
                    nextMatrixCols[i][j] = nextMatrix[i][colOrder.get(j)];
                }
                nextMachineNames.add(currentMachineNames.get(colOrder.get(j)));
            }
            int[] nextColValues = colOrder.stream().mapToInt(j -> colValues[j]).toArray();
            int[] nextColRanks = colOrder.stream().mapToInt(j -> getRanks(colValues)[j]).toArray();

            // --- Stabilization check ---
            List<Integer> newRowOrder = Arrays.stream(nextMatrixCols)
                .map(row -> binaryToDecimal(row, colWeights))
                .collect(Collectors.toList());
            List<Integer> newColOrder = IntStream.range(0, nMachines)
                .mapToObj(j -> {
                    int[] col = new int[nProducts];
                    for (int i = 0; i < nProducts; i++) col[i] = nextMatrixCols[i][j];
                    return binaryToDecimal(col, rowWeights);
                })
                .collect(Collectors.toList());
            if (iteration > 1 && newRowOrder.equals(prevRowOrder) && newColOrder.equals(prevColOrder)) {
                stabilized = true;
            } else {
                prevRowOrder = newRowOrder;
                prevColOrder = newColOrder;
            }
            // Assign for next iteration
            currentMatrix = nextMatrixCols;
            currentProductNames = nextProductNames;
            currentMachineNames = nextMachineNames;
            iteration++;
            if (iteration > 20) break;
        }

        // Prepare response
        KingResponse response = new KingResponse();
        // You can add more details to the response as needed (matrix, names, etc.)
        response.setFinalMatrix(currentMatrix);
        response.setProductNames(currentProductNames);
        response.setMachineNames(currentMachineNames);
        return response;
    }

    // Méthode privée pour convertir la requête Map en MatrixRequest
    private MatrixRequest convertToMatrixRequest(Map<String, Object> matrixRequest) {
        MatrixRequest request = new MatrixRequest();
        List<List<Integer>> matrixList = (List<List<Integer>>) matrixRequest.get("matrix");
        List<Map<String, Object>> machinesList = (List<Map<String, Object>>) matrixRequest.get("machines");
        
        // Convertir la matrice en tableau 2D
        int[][] matrix = new int[matrixList.size()][matrixList.get(0).size()];
        for (int i = 0; i < matrixList.size(); i++) {
            for (int j = 0; j < matrixList.get(i).size(); j++) {
                matrix[i][j] = matrixList.get(i).get(j);
            }
        }
        
        // Convertir la liste des machines en MachineEntity
        List<MachineEntity> machines = machinesList.stream()
            .map(machineMap -> {
                MachineEntity machine = new MachineEntity();
                machine.setId(((Number) machineMap.get("id")).longValue());
                machine.setName((String) machineMap.get("name"));
                return machine;
            })
            .collect(Collectors.toList());
        
        request.setMatrix(matrix);
        request.setMachines(machines);
        return request;
    }

    // Helper methods
    private Set<Integer> getMachinesForProduct(List<List<Integer>> matrix, int product) {
        Set<Integer> machines = new HashSet<>();
        for (int m = 0; m < matrix.get(product).size(); m++) {
            if (matrix.get(product).get(m) > 0) machines.add(m);
        }
        return machines;
    }

    private int[] getRanks(int[] values) {
        Integer[] indices = IntStream.range(0, values.length)
                                     .boxed()
                                     .toArray(Integer[]::new);
        
        // Explicitly type the lambda parameter
        Arrays.sort(indices, Comparator.comparingInt((Integer i) -> values[i]).reversed());
        
        int[] ranks = new int[values.length];
        for (int rank = 0; rank < indices.length; rank++) {
            ranks[indices[rank]] = rank + 1;
        }
        return ranks;
    }

    private int binaryToDecimal(int[] binaryArray, int[] weights) {
        int decimal = 0;
        for (int i = 0; i < binaryArray.length; i++) {
            decimal += binaryArray[i] * weights[i];
        }
        return decimal;
    }

    private Map<String, Object> createSortData(int[] values, int[] ranks, int[] order, String type) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < order.length; i++) {
            items.add(Map.of(
                "index", order[i],
                "value", values[order[i]],
                "rank", ranks[order[i]]
            ));
        }
        
        return Map.of(
            "type", type,
            "values", values,
            "ranks", ranks,
            "order", order,
            "items", items
        );
    }

    private Map<String, Object> createEntityInfo(List<Map<String, Object>> entities, int index, String name, String type) {
        Map<String, Object> entity = entities.get(index);
        return Map.of(
            "id", entity.get("id"),
            "name", name,
            "index", index,
            "type", type
        );
    }

    // Sauvegarder la matrice d'assignation
    public Map<String, Object> saveMatrix(Map<String, Object> matrixRequest) {
        List<List<Integer>> matrix = (List<List<Integer>>) matrixRequest.get("matrix");
        List<Map<String, Object>> products = (List<Map<String, Object>>) matrixRequest.get("products");
        List<Map<String, Object>> machines = (List<Map<String, Object>>) matrixRequest.get("machines");
        
        if (matrix == null || products == null || machines == null) {
            throw new IllegalArgumentException("Données de matrice invalides");
        }

        // Supprimer toutes les opérations existantes
        operationRepository.deleteAll();

        // Créer de nouvelles opérations basées sur la matrice
        for (int i = 0; i < products.size(); i++) {
            Map<String, Object> product = products.get(i);
            for (int j = 0; j < machines.size(); j++) {
                if (matrix.get(i).get(j) == 1) {
                    ProductMachineOperation operation = new ProductMachineOperation();
                    operation.setArticle(articleRepo.findById(((Number) product.get("id")).longValue())
                            .orElseThrow(() -> new RuntimeException("Article non trouvé")));
                    operation.setMachine(machineRepository.findById(((Number) machines.get(j).get("id")).longValue())
                            .orElseThrow(() -> new RuntimeException("Machine non trouvée")));
                    operation.setOperationNumber(1);
                    operationRepository.save(operation);
                }
            }
        }

        return getMatrix();
    }

    public Map<String, Object> analyseRangsMoyens(Map<String, Map<String, Integer>> gammes) {
        // Step 1: Collect all machines
        Set<String> machines = new TreeSet<>();
        for (Map<String, Integer> ops : gammes.values()) {
            machines.addAll(ops.keySet());
        }

        // Step 2: Compute stats for each machine
        Map<String, Map<String, Object>> stats = new HashMap<>();
        for (String m : machines) {
            stats.put(m, new HashMap<>(Map.of("total", 0, "count", 0, "moyen", 0.0)));
        }
        for (Map<String, Integer> ops : gammes.values()) {
            for (Map.Entry<String, Integer> entry : ops.entrySet()) {
                String m = entry.getKey();
                int rang = entry.getValue();
                stats.get(m).put("total", (int)stats.get(m).get("total") + rang);
                stats.get(m).put("count", (int)stats.get(m).get("count") + 1);
            }
        }
        for (String m : stats.keySet()) {
            int total = (int)stats.get(m).get("total");
            int count = (int)stats.get(m).get("count");
            double moyen = count > 0 ? Math.round((double)total / count * 100.0) / 100.0 : 0.0;
            stats.get(m).put("moyen", moyen);
        }

        // Step 3: Group machines by average rank
        Map<Double, List<String>> niveaux = new TreeMap<>();
        for (String m : stats.keySet()) {
            double moyen = (double)stats.get(m).get("moyen");
            niveaux.computeIfAbsent(moyen, k -> new ArrayList<>()).add(m);
        }

        // Step 4: Prepare response
        return Map.of(
            "stats", stats,
            "niveaux", niveaux
        );
    }
}