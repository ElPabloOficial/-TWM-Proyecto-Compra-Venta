using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TiendaOnline.API.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<almacenar> almacenars { get; set; }

    public virtual DbSet<calificacion> calificacions { get; set; }

    public virtual DbSet<carritocompra> carritocompras { get; set; }

    public virtual DbSet<categorium> categoria { get; set; }

    public virtual DbSet<comuna> comunas { get; set; }

    public virtual DbSet<correo> correos { get; set; }

    public virtual DbSet<cotizacion> cotizacions { get; set; }

    public virtual DbSet<crear1> crear1s { get; set; }

    public virtual DbSet<crear2> crear2s { get; set; }

    public virtual DbSet<crear3> crear3s { get; set; }

    public virtual DbSet<crear4> crear4s { get; set; }

    public virtual DbSet<despachar2> despachar2s { get; set; }

    public virtual DbSet<despacho> despachos { get; set; }

    public virtual DbSet<devolucion> devolucions { get; set; }

    public virtual DbSet<direccion> direccions { get; set; }

    public virtual DbSet<empresa> empresas { get; set; }

    public virtual DbSet<empresadespacho> empresadespachos { get; set; }

    public virtual DbSet<enviar> enviars { get; set; }

    public virtual DbSet<escribir1> escribir1s { get; set; }

    public virtual DbSet<escribir2> escribir2s { get; set; }

    public virtual DbSet<generar1> generar1s { get; set; }

    public virtual DbSet<generar2> generar2s { get; set; }

    public virtual DbSet<generar3> generar3s { get; set; }

    public virtual DbSet<generar4> generar4s { get; set; }

    public virtual DbSet<hacer1> hacer1s { get; set; }

    public virtual DbSet<hacer2> hacer2s { get; set; }

    public virtual DbSet<inventario> inventarios { get; set; }

    public virtual DbSet<listadeseo> listadeseos { get; set; }

    public virtual DbSet<mensaje> mensajes { get; set; }

    public virtual DbSet<ofertum> oferta { get; set; }

    public virtual DbSet<ofrecer1> ofrecer1s { get; set; }

    public virtual DbSet<ofrecer2> ofrecer2s { get; set; }

    public virtual DbSet<pago> pagos { get; set; }

    public virtual DbSet<pregunta> preguntas { get; set; }

    public virtual DbSet<producto> productos { get; set; }

    public virtual DbSet<provincium> provincia { get; set; }

    public virtual DbSet<region> regions { get; set; }

    public virtual DbSet<servicio> servicios { get; set; }

    public virtual DbSet<solicitar1> solicitar1s { get; set; }

    public virtual DbSet<solicitar2> solicitar2s { get; set; }

    public virtual DbSet<telefono> telefonos { get; set; }

    public virtual DbSet<usuario> usuarios { get; set; }

    public virtual DbSet<valorar> valorars { get; set; }

    public virtual DbSet<ventum> venta { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<almacenar>(entity =>
        {
            entity.HasKey(e => new { e.id_inventario, e.id_producto }).HasName("almacenar_pkey");

            entity.ToTable("almacenar");

            entity.HasOne(d => d.id_inventarioNavigation).WithMany(p => p.almacenars)
                .HasForeignKey(d => d.id_inventario)
                .HasConstraintName("almacenar_id_inventario_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.almacenars)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("almacenar_id_producto_fkey");
        });

        modelBuilder.Entity<calificacion>(entity =>
        {
            entity.HasKey(e => e.id).HasName("calificacion_pkey");

            entity.ToTable("calificacion");

            entity.HasIndex(e => e.fecha, "idx_calificacion_fecha");

            entity.Property(e => e.id).ValueGeneratedOnAdd();            entity.Property(e => e.calificacion1).HasColumnName("calificacion");
            entity.Property(e => e.comentario).HasMaxLength(200);
            entity.Property(e => e.fecha).HasColumnType("timestamp without time zone");
        });

        modelBuilder.Entity<carritocompra>(entity =>
        {
            entity.HasKey(e => e.id).HasName("carritocompra_pkey");

            entity.ToTable("carritocompra");
            
            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.estado).HasMaxLength(20);
            entity.Property(e => e.ultimaactualizacion).HasColumnType("timestamp without time zone");
        });

        modelBuilder.Entity<categorium>(entity =>
        {
            entity.HasKey(e => e.id).HasName("categoria_pkey");

            entity.HasIndex(e => e.nombre, "idx_categoria_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.nombre).HasMaxLength(50);

            entity.HasOne(d => d.id_categoriaNavigation).WithMany(p => p.Inverseid_categoriaNavigation)
                .HasForeignKey(d => d.id_categoria)
                .HasConstraintName("categoria_id_categoria_fkey");
        });

        modelBuilder.Entity<comuna>(entity =>
        {
            entity.HasKey(e => e.id).HasName("comuna_pkey");

            entity.ToTable("comuna");

            entity.HasIndex(e => e.nombre, "idx_comuna_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.nombre).HasMaxLength(100);

            entity.HasOne(d => d.id_provinciaNavigation).WithMany(p => p.comunas)
                .HasForeignKey(d => d.id_provincia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("comuna_id_provincia_fkey");
        });

        modelBuilder.Entity<correo>(entity =>
        {
            entity.HasKey(e => e.correo1).HasName("correo_pkey");

            entity.ToTable("correo");

            entity.Property(e => e.correo1)
                .HasMaxLength(100)
                .HasColumnName("correo");
            entity.Property(e => e.id_empresa).HasMaxLength(11);
            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_empresaNavigation).WithMany(p => p.correos)
                .HasForeignKey(d => d.id_empresa)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("correo_id_empresa_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.correos)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("correo_id_usuario_fkey");
        });

        modelBuilder.Entity<cotizacion>(entity =>
        {
            entity.HasKey(e => e.id).HasName("cotizacion_pkey");

            entity.ToTable("cotizacion");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.estado).HasMaxLength(20);
        });

        modelBuilder.Entity<crear1>(entity =>
        {
            entity.HasKey(e => new { e.id_producto, e.id_lista }).HasName("crear1_pkey");

            entity.ToTable("crear1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_listaNavigation).WithMany(p => p.crear1s)
                .HasForeignKey(d => d.id_lista)
                .HasConstraintName("crear1_id_lista_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.crear1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("crear1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.crear1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("crear1_id_usuario_fkey");
        });

        modelBuilder.Entity<crear2>(entity =>
        {
            entity.HasKey(e => new { e.id_servicio, e.id_lista }).HasName("crear2_pkey");

            entity.ToTable("crear2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_listaNavigation).WithMany(p => p.crear2s)
                .HasForeignKey(d => d.id_lista)
                .HasConstraintName("crear2_id_lista_fkey");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.crear2s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("crear2_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.crear2s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("crear2_id_usuario_fkey");
        });

        modelBuilder.Entity<crear3>(entity =>
        {
            entity.HasKey(e => new { e.id_carrito, e.id_producto }).HasName("crear3_pkey");

            entity.ToTable("crear3");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_carritoNavigation).WithMany(p => p.crear3s)
                .HasForeignKey(d => d.id_carrito)
                .HasConstraintName("crear3_id_carrito_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.crear3s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("crear3_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.crear3s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("crear3_id_usuario_fkey");
        });

        modelBuilder.Entity<crear4>(entity =>
        {
            entity.HasKey(e => new { e.id_carrito, e.id_servicio }).HasName("crear4_pkey");

            entity.ToTable("crear4");

            entity.Property(e => e.cantidad).HasDefaultValue(1);
            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_carritoNavigation).WithMany(p => p.crear4s)
                .HasForeignKey(d => d.id_carrito)
                .HasConstraintName("crear4_id_carrito_fkey");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.crear4s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("crear4_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.crear4s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("crear4_id_usuario_fkey");
        });

        modelBuilder.Entity<despachar2>(entity =>
        {
            entity.HasKey(e => new { e.id_empresad, e.id_despacho }).HasName("despachar2_pkey");

            entity.ToTable("despachar2");

            entity.HasOne(d => d.id_despachoNavigation).WithMany(p => p.despachar2s)
                .HasForeignKey(d => d.id_despacho)
                .HasConstraintName("despachar2_id_despacho_fkey");

            entity.HasOne(d => d.id_empresadNavigation).WithMany(p => p.despachar2s)
                .HasForeignKey(d => d.id_empresad)
                .HasConstraintName("despachar2_id_empresad_fkey");
        });

        modelBuilder.Entity<despacho>(entity =>
        {
            entity.HasKey(e => e.id).HasName("despacho_pkey");

            entity.ToTable("despacho");

            entity.HasIndex(e => e.estado, "idx_despacho_estado");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.datoslogisticos).HasColumnType("json");
            entity.Property(e => e.estado).HasMaxLength(20);

            entity.HasOne(d => d.id_direccionNavigation).WithMany(p => p.despachos)
                .HasForeignKey(d => d.id_direccion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("despacho_id_direccion_fkey");
        });

        modelBuilder.Entity<devolucion>(entity =>
        {
            entity.HasKey(e => e.id).HasName("devolucion_pkey");

            entity.ToTable("devolucion");

            entity.HasIndex(e => e.estado, "idx_devolucion_estado");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.estado).HasMaxLength(20);
            entity.Property(e => e.motivo).HasMaxLength(200);
            entity.Property(e => e.tipodevolucion).HasMaxLength(30);
        });

        modelBuilder.Entity<direccion>(entity =>
        {
            entity.HasKey(e => e.id).HasName("direccion_pkey");

            entity.ToTable("direccion");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.calle).HasMaxLength(100);
            entity.Property(e => e.descripcion).HasMaxLength(100);
            entity.Property(e => e.pasaje).HasMaxLength(100);
            entity.Property(e => e.sector).HasMaxLength(100);

            entity.HasOne(d => d.id_comunaNavigation).WithMany(p => p.direccions)
                .HasForeignKey(d => d.id_comuna)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("direccion_id_comuna_fkey");
        });

        modelBuilder.Entity<empresa>(entity =>
        {
            entity.HasKey(e => e.rut).HasName("empresa_pkey");

            entity.ToTable("empresa");

            entity.HasIndex(e => e.nombre, "idx_empresa_nombre");

            entity.Property(e => e.rut).HasMaxLength(11);
            entity.Property(e => e.giro).HasMaxLength(100);
            entity.Property(e => e.nombre).HasMaxLength(100);
            entity.Property(e => e.paginaweb).HasMaxLength(100);

            entity.HasMany(d => d.id_direccions).WithMany(p => p.id_empresas)
                .UsingEntity<Dictionary<string, object>>(
                    "registrar5",
                    r => r.HasOne<direccion>().WithMany()
                        .HasForeignKey("id_direccion")
                        .HasConstraintName("registrar5_id_direccion_fkey"),
                    l => l.HasOne<empresa>().WithMany()
                        .HasForeignKey("id_empresa")
                        .HasConstraintName("registrar5_id_empresa_fkey"),
                    j =>
                    {
                        j.HasKey("id_empresa", "id_direccion").HasName("registrar5_pkey");
                        j.ToTable("registrar5");
                        j.IndexerProperty<string>("id_empresa").HasMaxLength(11);
                    });
        });

        modelBuilder.Entity<empresadespacho>(entity =>
        {
            entity.HasKey(e => e.id).HasName("empresadespacho_pkey");

            entity.ToTable("empresadespacho");

entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.estandaresvolumetricos).HasColumnType("json");
            entity.Property(e => e.nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<enviar>(entity =>
        {
            entity.HasKey(e => new { e.id_venta, e.id_mensaje }).HasName("enviar_pkey");

            entity.ToTable("enviar");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_mensajeNavigation).WithMany(p => p.enviars)
                .HasForeignKey(d => d.id_mensaje)
                .HasConstraintName("enviar_id_mensaje_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.enviars)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("enviar_id_usuario_fkey");

            entity.HasOne(d => d.id_ventaNavigation).WithMany(p => p.enviars)
                .HasForeignKey(d => d.id_venta)
                .HasConstraintName("enviar_id_venta_fkey");
        });

        modelBuilder.Entity<escribir1>(entity =>
        {
            entity.HasKey(e => new { e.id_calificacion, e.id_producto }).HasName("escribir1_pkey");

            entity.ToTable("escribir1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_calificacionNavigation).WithMany(p => p.escribir1s)
                .HasForeignKey(d => d.id_calificacion)
                .HasConstraintName("escribir1_id_calificacion_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.escribir1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("escribir1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.escribir1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("escribir1_id_usuario_fkey");
        });

        modelBuilder.Entity<escribir2>(entity =>
        {
            entity.HasKey(e => new { e.id_calificacion, e.id_servicio }).HasName("escribir2_pkey");

            entity.ToTable("escribir2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_calificacionNavigation).WithMany(p => p.escribir2s)
                .HasForeignKey(d => d.id_calificacion)
                .HasConstraintName("escribir2_id_calificacion_fkey");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.escribir2s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("escribir2_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.escribir2s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("escribir2_id_usuario_fkey");
        });

        modelBuilder.Entity<generar1>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_devolucion }).HasName("generar1_pkey");

            entity.ToTable("generar1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_devolucionNavigation).WithMany(p => p.generar1s)
                .HasForeignKey(d => d.id_devolucion)
                .HasConstraintName("generar1_id_devolucion_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.generar1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("generar1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.generar1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("generar1_id_usuario_fkey");

            entity.HasOne(d => d.id_ventaNavigation).WithMany(p => p.generar1s)
                .HasForeignKey(d => d.id_venta)
                .HasConstraintName("generar1_id_venta_fkey");
        });

        modelBuilder.Entity<generar2>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_despacho }).HasName("generar2_pkey");

            entity.ToTable("generar2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_despachoNavigation).WithMany(p => p.generar2s)
                .HasForeignKey(d => d.id_despacho)
                .HasConstraintName("generar2_id_despacho_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.generar2s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("generar2_id_usuario_fkey");

            entity.HasOne(d => d.id_ventaNavigation).WithMany(p => p.generar2s)
                .HasForeignKey(d => d.id_venta)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("generar2_id_venta_fkey");
        });

        modelBuilder.Entity<generar3>(entity =>
        {
            entity.HasKey(e => new { e.id_venta, e.id_producto }).HasName("generar3_pkey");

            entity.ToTable("generar3");

            entity.HasIndex(e => e.totalfinal, "idx_generar3_totalfinal");

            entity.HasOne(d => d.id_pagoNavigation).WithMany(p => p.generar3s)
                .HasForeignKey(d => d.id_pago)
                .HasConstraintName("generar3_id_pago_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.generar3s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("generar3_id_producto_fkey");

            entity.HasOne(d => d.id_ventaNavigation).WithMany(p => p.generar3s)
                .HasForeignKey(d => d.id_venta)
                .HasConstraintName("generar3_id_venta_fkey");
        });

        modelBuilder.Entity<generar4>(entity =>
        {
            entity.HasKey(e => new { e.id_venta, e.id_servicio }).HasName("generar4_pkey");

            entity.ToTable("generar4");

            entity.HasIndex(e => e.totalfinal, "idx_generar4_totalfinal");

            entity.Property(e => e.cantidad).HasDefaultValue(1);

            entity.HasOne(d => d.id_pagoNavigation).WithMany(p => p.generar4s)
                .HasForeignKey(d => d.id_pago)
                .HasConstraintName("generar4_id_pago_fkey");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.generar4s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("generar4_id_servicio_fkey");

            entity.HasOne(d => d.id_ventaNavigation).WithMany(p => p.generar4s)
                .HasForeignKey(d => d.id_venta)
                .HasConstraintName("generar4_id_venta_fkey");
        });

        modelBuilder.Entity<hacer1>(entity =>
        {
            entity.HasKey(e => new { e.id_producto, e.id_pregunta, e.id_usuario }).HasName("hacer1_pkey");

            entity.ToTable("hacer1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_preguntaNavigation).WithMany(p => p.hacer1s)
                .HasForeignKey(d => d.id_pregunta)
                .HasConstraintName("hacer1_id_pregunta_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.hacer1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("hacer1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.hacer1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("hacer1_id_usuario_fkey");
        });

        modelBuilder.Entity<hacer2>(entity =>
        {
            entity.HasKey(e => new { e.id_servicio, e.id_pregunta, e.id_usuario }).HasName("hacer2_pkey");

            entity.ToTable("hacer2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_preguntaNavigation).WithMany(p => p.hacer2s)
                .HasForeignKey(d => d.id_pregunta)
                .HasConstraintName("hacer2_id_pregunta_fkey");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.hacer2s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("hacer2_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.hacer2s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("hacer2_id_usuario_fkey");
        });

        modelBuilder.Entity<inventario>(entity =>
        {
            entity.HasKey(e => e.id).HasName("inventario_pkey");

            entity.ToTable("inventario");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.inventarios)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("inventario_id_usuario_fkey");
        });

        modelBuilder.Entity<listadeseo>(entity =>
        {
            entity.HasKey(e => e.id).HasName("listadeseos_pkey");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.descripcion).HasMaxLength(200);
            entity.Property(e => e.nombrelista).HasMaxLength(50);
        });

        modelBuilder.Entity<mensaje>(entity =>
        {
            entity.HasKey(e => e.id).HasName("mensaje_pkey");

            entity.ToTable("mensaje");

            entity.HasIndex(e => e.estado, "idx_mensaje_estado");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.contenido).HasMaxLength(200);
            entity.Property(e => e.estado).HasMaxLength(20);
            entity.Property(e => e.fecharespuesta).HasColumnType("timestamp without time zone");
        });

        modelBuilder.Entity<ofertum>(entity =>
        {
            entity.HasKey(e => e.id).HasName("oferta_pkey");

            entity.HasIndex(e => e.estado, "idx_oferta_estado");

            entity.HasIndex(e => e.preciooferta, "idx_oferta_preciooferta");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.preciooferta).HasPrecision(3, 2);
        });

        modelBuilder.Entity<ofrecer1>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_producto }).HasName("ofrecer1_pkey");

            entity.ToTable("ofrecer1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);
            entity.Property(e => e.tipobien).HasMaxLength(30);

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.ofrecer1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("ofrecer1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.ofrecer1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("ofrecer1_id_usuario_fkey");
        });

        modelBuilder.Entity<ofrecer2>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_servicio }).HasName("ofrecer2_pkey");

            entity.ToTable("ofrecer2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);
            entity.Property(e => e.tipobien).HasMaxLength(30);

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.ofrecer2s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("ofrecer2_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.ofrecer2s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("ofrecer2_id_usuario_fkey");
        });

        modelBuilder.Entity<pago>(entity =>
        {
            entity.HasKey(e => e.id).HasName("pago_pkey");

            entity.ToTable("pago");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.mediopago).HasMaxLength(20);
        });

        modelBuilder.Entity<pregunta>(entity =>
        {
            entity.HasKey(e => e.id).HasName("preguntas_pkey");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.fechacreacion).HasColumnType("timestamp without time zone");
            entity.Property(e => e.fecharespuesta).HasColumnType("timestamp without time zone");
            entity.Property(e => e.pregunta1)
                .HasMaxLength(200)
                .HasColumnName("pregunta");
            entity.Property(e => e.respuesta).HasMaxLength(200);
        });

        modelBuilder.Entity<producto>(entity =>
        {
            entity.HasKey(e => e.id).HasName("producto_pkey");

            entity.ToTable("producto");

            entity.HasIndex(e => e.fechafin, "idx_producto_fechafin");

            entity.HasIndex(e => e.nombre, "idx_producto_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.caracteristicas).HasColumnType("json");
            entity.Property(e => e.nombre).HasMaxLength(50);

            entity.HasOne(d => d.id_ofertaNavigation).WithMany(p => p.productos)
                .HasForeignKey(d => d.id_oferta)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("producto_id_oferta_fkey");

            entity.HasMany(d => d.id_categoria).WithMany(p => p.id_productos)
                .UsingEntity<Dictionary<string, object>>(
                    "pertenecer1",
                    r => r.HasOne<categorium>().WithMany()
                        .HasForeignKey("id_categoria")
                        .HasConstraintName("pertenecer1_id_categoria_fkey"),
                    l => l.HasOne<producto>().WithMany()
                        .HasForeignKey("id_producto")
                        .HasConstraintName("pertenecer1_id_producto_fkey"),
                    j =>
                    {
                        j.HasKey("id_producto", "id_categoria").HasName("pertenecer1_pkey");
                        j.ToTable("pertenecer1");
                    });
        });

        modelBuilder.Entity<provincium>(entity =>
        {
            entity.HasKey(e => e.id).HasName("provincia_pkey");

            entity.HasIndex(e => e.nombre, "idx_provincia_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.nombre).HasMaxLength(100);

            entity.HasOne(d => d.id_regionNavigation).WithMany(p => p.provincia)
                .HasForeignKey(d => d.id_region)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("provincia_id_region_fkey");
        });

        modelBuilder.Entity<region>(entity =>
        {
            entity.HasKey(e => e.id).HasName("region_pkey");

            entity.ToTable("region");

            entity.HasIndex(e => e.nombre, "idx_region_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<servicio>(entity =>
        {
            entity.HasKey(e => e.id).HasName("servicio_pkey");

            entity.ToTable("servicio");

            entity.HasIndex(e => e.fechafin, "idx_servicio_fechafin");

            entity.HasIndex(e => e.nombre, "idx_servicio_nombre");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.caracteristicas).HasColumnType("json");
            entity.Property(e => e.nombre).HasMaxLength(50);

            entity.HasOne(d => d.id_ofertaNavigation).WithMany(p => p.servicios)
                .HasForeignKey(d => d.id_oferta)
                .HasConstraintName("servicio_id_oferta_fkey");

            entity.HasMany(d => d.id_categoria).WithMany(p => p.id_servicios)
                .UsingEntity<Dictionary<string, object>>(
                    "pertenecer2",
                    r => r.HasOne<categorium>().WithMany()
                        .HasForeignKey("id_categoria")
                        .HasConstraintName("pertenecer2_id_categoria_fkey"),
                    l => l.HasOne<servicio>().WithMany()
                        .HasForeignKey("id_servicio")
                        .HasConstraintName("pertenecer2_id_servicio_fkey"),
                    j =>
                    {
                        j.HasKey("id_servicio", "id_categoria").HasName("pertenecer2_pkey");
                        j.ToTable("pertenecer2");
                    });
        });

        modelBuilder.Entity<solicitar1>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_producto, e.id_cotizacion }).HasName("solicitar1_pkey");

            entity.ToTable("solicitar1");

            entity.Property(e => e.id_usuario).HasMaxLength(11);
            entity.Property(e => e.cantidad).HasDefaultValue(1);

            entity.HasOne(d => d.id_cotizacionNavigation).WithMany(p => p.solicitar1s)
                .HasForeignKey(d => d.id_cotizacion)
                .HasConstraintName("solicitar1_id_cotizacion_fkey");

            entity.HasOne(d => d.id_productoNavigation).WithMany(p => p.solicitar1s)
                .HasForeignKey(d => d.id_producto)
                .HasConstraintName("solicitar1_id_producto_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.solicitar1s)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("solicitar1_id_usuario_fkey");
        });

        modelBuilder.Entity<solicitar2>(entity =>
        {
            entity.HasKey(e => new { e.id_usuario, e.id_servicio, e.id_cotizacion, e.id_oferente }).HasName("solicitar2_pkey");

            entity.ToTable("solicitar2");

            entity.Property(e => e.id_usuario).HasMaxLength(11);
            entity.Property(e => e.id_oferente).HasMaxLength(11);
            entity.Property(e => e.cantidad).HasDefaultValue(1);

            entity.HasOne(d => d.id_cotizacionNavigation).WithMany(p => p.solicitar2s)
                .HasForeignKey(d => d.id_cotizacion)
                .HasConstraintName("solicitar2_id_cotizacion_fkey");

            entity.HasOne(d => d.id_oferenteNavigation).WithMany(p => p.solicitar2id_oferenteNavigations)
                .HasForeignKey(d => d.id_oferente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_solicitar2_oferente");

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.solicitar2s)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("solicitar2_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.solicitar2id_usuarioNavigations)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("solicitar2_id_usuario_fkey");

            entity.HasOne(d => d.valorar).WithMany(p => p.solicitar2s)
                .HasForeignKey(d => new { d.id_servicio, d.id_oferente })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_solicitar2_valorar");
        });

        modelBuilder.Entity<telefono>(entity =>
        {
            entity.HasKey(e => e.numero).HasName("telefono_pkey");

            entity.ToTable("telefono");

            entity.Property(e => e.numero).ValueGeneratedNever();
            entity.Property(e => e.id_empresa).HasMaxLength(11);
            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_empresaNavigation).WithMany(p => p.telefonos)
                .HasForeignKey(d => d.id_empresa)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("telefono_id_empresa_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.telefonos)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("telefono_id_usuario_fkey");
        });

        modelBuilder.Entity<usuario>(entity =>
        {
            entity.HasKey(e => e.rut).HasName("usuario_pkey");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.nombre, "idx_usuario_nombre");

            entity.Property(e => e.rut).HasMaxLength(11);
            entity.Property(e => e.clave).HasMaxLength(30);
            entity.Property(e => e.descuentos).HasColumnType("json");
            entity.Property(e => e.nombre).HasMaxLength(100);
            entity.Property(e => e.tipousuario).HasMaxLength(20);

            entity.HasMany(d => d.id_direccions).WithMany(p => p.id_usuarios)
                .UsingEntity<Dictionary<string, object>>(
                    "registrar2",
                    r => r.HasOne<direccion>().WithMany()
                        .HasForeignKey("id_direccion")
                        .HasConstraintName("registrar2_id_direccion_fkey"),
                    l => l.HasOne<usuario>().WithMany()
                        .HasForeignKey("id_usuario")
                        .HasConstraintName("registrar2_id_usuario_fkey"),
                    j =>
                    {
                        j.HasKey("id_usuario", "id_direccion").HasName("registrar2_pkey");
                        j.ToTable("registrar2");
                        j.IndexerProperty<string>("id_usuario").HasMaxLength(11);
                    });

            entity.HasMany(d => d.id_empresas).WithMany(p => p.id_usuarios)
                .UsingEntity<Dictionary<string, object>>(
                    "tener3",
                    r => r.HasOne<empresa>().WithMany()
                        .HasForeignKey("id_empresa")
                        .HasConstraintName("tener3_id_empresa_fkey"),
                    l => l.HasOne<usuario>().WithMany()
                        .HasForeignKey("id_usuario")
                        .HasConstraintName("tener3_id_usuario_fkey"),
                    j =>
                    {
                        j.HasKey("id_usuario", "id_empresa").HasName("tener3_pkey");
                        j.ToTable("tener3");
                        j.IndexerProperty<string>("id_usuario").HasMaxLength(11);
                        j.IndexerProperty<string>("id_empresa").HasMaxLength(11);
                    });
        });

        modelBuilder.Entity<valorar>(entity =>
        {
            entity.HasKey(e => new { e.id_servicio, e.id_usuario }).HasName("valorar_pkey");

            entity.ToTable("valorar");

            entity.Property(e => e.id_usuario).HasMaxLength(11);

            entity.HasOne(d => d.id_servicioNavigation).WithMany(p => p.valorars)
                .HasForeignKey(d => d.id_servicio)
                .HasConstraintName("valorar_id_servicio_fkey");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.valorars)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("valorar_id_usuario_fkey");
        });

        modelBuilder.Entity<ventum>(entity =>
        {
            entity.HasKey(e => e.id).HasName("venta_pkey");

            entity.HasIndex(e => e.estado, "idx_venta_estado");

            entity.HasIndex(e => e.fecha, "idx_venta_fecha");

            entity.HasIndex(e => e.iva, "idx_venta_iva");

            entity.HasIndex(e => e.neto, "idx_venta_neto");

            entity.Property(e => e.id).ValueGeneratedOnAdd();
            entity.Property(e => e.estado).HasMaxLength(20);
            entity.Property(e => e.fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.id_cliente).HasMaxLength(11);
            entity.Property(e => e.id_vendedor).HasMaxLength(11);
            entity.Property(e => e.iva).HasPrecision(3, 2);
            entity.Property(e => e.nota).HasMaxLength(200);

            entity.HasOne(d => d.id_clienteNavigation).WithMany(p => p.ventumid_clienteNavigations)
                .HasForeignKey(d => d.id_cliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("venta_id_cliente_fkey");

            entity.HasOne(d => d.id_vendedorNavigation).WithMany(p => p.ventumid_vendedorNavigations)
                .HasForeignKey(d => d.id_vendedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("venta_id_vendedor_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
